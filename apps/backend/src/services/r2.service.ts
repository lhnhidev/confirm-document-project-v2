import { S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

let s3Client: S3Client | null = null;

function getS3Client(): S3Client | null {
  const accountId = process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_R2_ACCOUNT_ID || "";
  const accessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "";
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "";
  const endpoint = process.env.R2_ENDPOINT || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : "");

  if (!s3Client && endpoint && accessKeyId && secretAccessKey) {
    s3Client = new S3Client({
      region: "auto",
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }
  return s3Client;
}

function slugify(str: string): string {
  if (!str) return "unknown";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/**
 * Uploads evidence files to Cloudflare R2 following the requested folder hierarchy:
 * 1. User folder: id_người_dùng_hiện_tại-tên_người_dùng-role-môn_dạy
 * 2. Field folder: fieldCode (e.g. I, II, III, IV...)
 * 3. Criteria folder: criteriaId (e.g. TC101, TC102...)
 * 4. Files saved inside that criteria folder.
 */
export async function uploadFilesToR2(
  user: { userId: string; fullName: string; role: string; major?: string; departmentName?: string },
  fieldCode: string,
  criteriaId: string,
  files: Express.Multer.File[]
): Promise<{ urlFile: string; fileNames: string; fileFormats: string; totalSize: number }> {
  const client = getS3Client();
  const bucketName = process.env.R2_BUCKET_NAME || process.env.CLOUDFLARE_R2_BUCKET_NAME || "confirm-documents";
  const accountId = process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_R2_ACCOUNT_ID || "";
  
  const userId = user.userId || "USR-000";
  const userNameSlug = slugify(user.fullName || "User");
  const roleSlug = slugify(user.role || "teacher");
  const majorSlug = slugify(user.major || user.departmentName || "General");

  // 1. User folder
  const userFolder = `${userId}-${userNameSlug}-${roleSlug}-${majorSlug}`;

  // 2. Field folder (fieldCode: I, II, III, IV...)
  const cleanFieldCode = slugify(fieldCode || "I");

  // 3. Criteria folder (criteriaId: TC101...)
  const cleanCriteriaId = slugify(criteriaId || "TC101");

  const folderPath = `${userFolder}/${cleanFieldCode}/${cleanCriteriaId}/`;

  let primaryUrl = "#";
  const fileNamesArr: string[] = [];
  const fileFormatsArr: string[] = [];
  let totalSize = 0;

  for (const file of files) {
    fileNamesArr.push(file.originalname);
    fileFormatsArr.push(file.mimetype || "application/pdf");
    totalSize += file.size || 0;

    const uniqueFileName = `${Date.now()}-${slugify(file.originalname)}`;
    const objectKey = `${folderPath}${uniqueFileName}`;

    if (client) {
      try {
        // Check if folder prefix exists in R2, if not create folder marker
        const listCmd = new ListObjectsV2Command({
          Bucket: bucketName,
          Prefix: folderPath,
          MaxKeys: 1,
        });
        const listRes = await client.send(listCmd);
        if (!listRes.Contents || listRes.Contents.length === 0) {
          await client.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: folderPath,
            Body: "",
          }));
        }

        // Upload file to Cloudflare R2
        await client.send(new PutObjectCommand({
          Bucket: bucketName,
          Key: objectKey,
          Body: file.buffer,
          ContentType: file.mimetype,
        }));

        const publicDomain = process.env.R2_PUBLIC_DOMAIN || process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN || (accountId ? `https://pub-${accountId}.r2.dev/${bucketName}` : "https://pub-r2.example.com");
        const fileUrl = `${publicDomain}/${objectKey}`;
        if (primaryUrl === "#") {
          primaryUrl = fileUrl;
        }
      } catch (err) {
        console.error("❌ Cloudflare R2 Upload Error:", err);
        const fallbackUrl = `https://r2.cloudflare.com/${objectKey}`;
        if (primaryUrl === "#") {
          primaryUrl = fallbackUrl;
        }
      }
    } else {
      // Simulation mode when R2 credentials are not yet set
      console.log(`[Cloudflare R2 Simulation] Target Folder: ${folderPath}, File: ${file.originalname}`);
      const simUrl = `https://r2.storage.simulated/${objectKey}`;
      if (primaryUrl === "#") {
        primaryUrl = simUrl;
      }
    }
  }

  return {
    urlFile: primaryUrl,
    fileNames: fileNamesArr.join(", "),
    fileFormats: fileFormatsArr[0] || "application/pdf",
    totalSize: totalSize || 1024000,
  };
}

/**
 * Deletes file from Cloudflare R2 bucket
 */
export async function deleteFileFromR2(urlFile?: string): Promise<boolean> {
  if (!urlFile || urlFile === "#") return false;
  const client = getS3Client();
  const bucketName = process.env.R2_BUCKET_NAME || process.env.CLOUDFLARE_R2_BUCKET_NAME || "confirm-documents";

  if (!client) {
    console.log(`[Cloudflare R2 Simulation] Delete file simulated for URL: ${urlFile}`);
    return true;
  }

  try {
    let key = "";
    try {
      const parsed = new URL(urlFile);
      let pathname = parsed.pathname.startsWith("/") ? parsed.pathname.slice(1) : parsed.pathname;
      if (pathname.startsWith(`${bucketName}/`)) {
        key = pathname.slice(bucketName.length + 1);
      } else {
        key = pathname;
      }
    } catch {
      key = urlFile;
    }

    if (key) {
      await client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: key,
        })
      );
      console.log(`✅ Deleted object ${key} from Cloudflare R2 bucket ${bucketName}`);
      return true;
    }
  } catch (err) {
    console.error("❌ Cloudflare R2 Delete Error:", err);
  }
  return false;
}
