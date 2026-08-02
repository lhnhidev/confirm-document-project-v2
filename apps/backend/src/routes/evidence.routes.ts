import { Router, type Response } from "express";
import { Types } from "mongoose";
import multer from "multer";
import { get as httpsGet } from "https";
import { get as httpGet } from "http";
import { Evidence, EvidenceStatus } from "../models/evidence.model.ts";
import { User, UserRole } from "../models/user.model.ts";
import { Field } from "../models/field.model.ts";
import { authenticateToken, authorizeRoles, type AuthRequest } from "../middleware/auth.middleware.ts";
import { FALLBACK_FIELDS } from "../db/seedFieldsData.ts";
import { uploadFilesToR2 } from "../services/r2.service.ts";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Total criteria count from the 8 fields = 35
const TOTAL_CRITERIA_COUNT = FALLBACK_FIELDS.reduce((acc, f) => acc + f.criteria.length, 0);

// Sample initial in-memory evidences
let inMemoryEvidences: any[] = [
  {
    id: "EV-001",
    evidenceId: "MC-2026-001",
    title: "Vận hành hệ thống quản lý học tập LMS cho học sinh",
    description: "Đã ứng dụng thành thạo thiết bị số và phần mềm học tập trong năm học.",
    standardName: "I. NĂNG LỰC SỬ DỤNG CÔNG NGHỆ SỐ",
    criteriaName: "TC101. Vận hành thiết bị số phục vụ công việc chuyên môn",
    originalFileName: "VanHanhThietBiSo_2025.pdf",
    fileFormat: "application/pdf",
    fileSize: 2450000,
    urlFile: "https://example.com/files/vanhanh_2025.pdf",
    currentStatus: EvidenceStatus.APPROVED,
    date: "2026-02-15",
    submittedBy: {
      userId: "USR-002",
      fullName: "Tống Thị Tuyết Huệ",
      email: "ttthuedtnt@gmail.com",
      departmentName: "Tổng hợp"
    },
    reviewComment: "Tổ trưởng đã phê duyệt minh chứng đạt chuẩn."
  }
];

/**
 * Helper to dynamically rewrite R2 URLs to use the configured Public Development Domain
 */
const ensureCorrectPublicUrl = (url: string): string => {
  if (!url || url === "#") return "#";
  const publicDomain = process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN || process.env.R2_PUBLIC_DOMAIN;
  if (!publicDomain) return url;

  if (url.includes(".r2.dev") || url.includes("r2.cloudflarestorage.com") || url.includes("r2.cloudflare.com")) {
    try {
      const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || process.env.R2_BUCKET_NAME || "confim-document-project-v2";
      const fallbackBucket = "confirm-documents";
      
      if (url.includes(`/${bucketName}/`)) {
        const parts = url.split(`/${bucketName}/`);
        if (parts.length > 1) {
          return `${publicDomain}/${parts.slice(1).join(`/${bucketName}/`)}`;
        }
      } else if (url.includes(`${bucketName}/`)) {
        const parts = url.split(`${bucketName}/`);
        if (parts.length > 1) {
          return `${publicDomain}/${parts.slice(1).join(`${bucketName}/`)}`;
        }
      }
      
      if (url.includes(`/${fallbackBucket}/`)) {
        const parts = url.split(`/${fallbackBucket}/`);
        if (parts.length > 1) {
          return `${publicDomain}/${parts.slice(1).join(`/${fallbackBucket}/`)}`;
        }
      }

      const parsed = new URL(url);
      const path = parsed.pathname;
      let cleanPath = path;
      if (cleanPath.startsWith(`/${bucketName}`)) {
        cleanPath = cleanPath.substring(bucketName.length + 1);
      } else if (cleanPath.startsWith(`/${fallbackBucket}`)) {
        cleanPath = cleanPath.substring(fallbackBucket.length + 1);
      }
      
      if (cleanPath.startsWith("/")) {
        cleanPath = cleanPath.substring(1);
      }
      
      return `${publicDomain}/${cleanPath}`;
    } catch (e) {
      console.error("Error parsing URL in ensureCorrectPublicUrl:", e);
    }
  }
  return url;
};

/**
 * Helper định dạng minh chứng từ MongoDB Atlas sang định dạng DTO cho Frontend
 */
const formatEvidenceItem = (e: any, fallbackUser?: any) => {
  let standardName = e.fieldId?.fieldName || "Tiêu chuẩn sư phạm";
  let criteriaName = "Tiêu chí sư phạm";

  if (e.fieldId && e.fieldId.criteria) {
    const crit = e.fieldId.criteria.find((c: any) => c._id.toString() === e.criterionId?.toString());
    if (crit) {
      criteriaName = `${crit.criteriaId}. ${crit.criteriaName}`;
    }
  }

  return {
    id: e._id ? e._id.toString() : e.id,
    evidenceId: e.evidenceId,
    title: e.title,
    description: e.description || "",
    standardName,
    criteriaName,
    originalFileName: e.originalFileName,
    fileFormat: e.fileFormat,
    fileSize: e.fileSize,
    urlFile: ensureCorrectPublicUrl(e.urlFile),
    currentStatus: e.currentStatus,
    date: e.date ? new Date(e.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    submittedBy: {
      userId: e.submittedBy?.userId || fallbackUser?.userId || "USR-002",
      fullName: e.submittedBy?.fullName || fallbackUser?.fullName || "Giáo viên",
      email: e.submittedBy?.email || fallbackUser?.email || "",
      departmentName: e.submittedBy?.departmentName || fallbackUser?.departmentName || "Tổng hợp",
    },
    reviewComment: e.reviewComment || "",
  };
};

/**
 * GET /api/evidences/download-proxy
 * Hỗ trợ tải tệp tin minh chứng bỏ qua rào cản CORS và buộc trình duyệt tải xuống.
 */
router.get("/download-proxy", async (req, res) => {
  try {
    const fileUrl = req.query.url as string;
    const filename = req.query.filename as string || "download";

    if (!fileUrl || fileUrl === "#") {
      return res.status(400).send("Không có đường dẫn tệp tin hợp lệ.");
    }

    const client = fileUrl.startsWith("https") ? httpsGet : httpGet;

    client(fileUrl, (stream) => {
      // Xử lý chuyển hướng nếu R2 trả về mã 3xx
      if (stream.statusCode && stream.statusCode >= 300 && stream.statusCode < 400 && stream.headers.location) {
        const redirectUrl = stream.headers.location;
        const nextClient = redirectUrl.startsWith("https") ? httpsGet : httpGet;
        nextClient(redirectUrl, (redirectStream) => {
          res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
          res.setHeader("Content-Type", redirectStream.headers["content-type"] || "application/octet-stream");
          redirectStream.pipe(res);
        }).on("error", (err) => {
          console.error("Lỗi download proxy redirect:", err);
          res.redirect(fileUrl);
        });
      } else {
        res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
        res.setHeader("Content-Type", stream.headers["content-type"] || "application/octet-stream");
        stream.pipe(res);
      }
    }).on("error", (err) => {
      console.error("Lỗi download proxy:", err);
      res.redirect(fileUrl);
    });
  } catch (error) {
    console.error("Lỗi trong download proxy:", error);
    res.status(500).send("Lỗi hệ thống khi tải tệp.");
  }
});

/**
 * GET /api/evidences/my-summary
 * Lấy dữ liệu tổng quan + danh sách minh chứng của giáo viên đang đăng nhập với phân trang backend (mặc định 10 tệp/trang)
 */
router.get("/my-summary", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Chưa xác thực người dùng!" });
    }

    const pageNum = Math.max(1, parseInt(req.query.page as string) || 1);
    const limitNum = Math.max(1, parseInt(req.query.limit as string) || 10);
    const searchQuery = (req.query.search as string || "").trim().toLowerCase();
    const statusFilter = (req.query.status as string || "all").trim();

    let dbUser = null;
    try {
      dbUser = await User.findOne({
        $or: [
          { email: user.email.toLowerCase() },
          { userId: user.userId }
        ]
      });
    } catch {
      dbUser = null;
    }

    let allTeacherEvidences: any[] = [];
    if (dbUser) {
      // Tìm tất cả Evidence của dbUser từ MongoDB Atlas, sắp xếp mới nhất lên đầu
      const dbEvidences = await Evidence.find({ submittedBy: dbUser._id })
        .sort({ date: -1, createdAt: -1 })
        .populate("submittedBy", "userId fullName email departmentName")
        .populate("fieldId", "fieldName fieldCode criteria");

      allTeacherEvidences = dbEvidences.map((e: any) => formatEvidenceItem(e, dbUser));
    }

    // Nếu chưa có trong DB Atlas, dùng fallback
    if (allTeacherEvidences.length === 0) {
      allTeacherEvidences = inMemoryEvidences.filter(
        (e) =>
          (e.submittedBy?.userId && e.submittedBy.userId === user.userId) ||
          (e.submittedBy?.email && user.email && e.submittedBy.email.toLowerCase() === user.email.toLowerCase())
      );
    }

    // Đếm số lượng tổng thể từ Atlas DB (dành cho các thẻ Thống Kê)
    const totalSubmitted = allTeacherEvidences.length;
    const approvedCount = allTeacherEvidences.filter((e) => e.currentStatus === EvidenceStatus.APPROVED).length;
    const pendingCount = allTeacherEvidences.filter((e) => e.currentStatus === EvidenceStatus.PENDING).length;
    const needsSupplementCount = allTeacherEvidences.filter((e) => e.currentStatus === EvidenceStatus.NEEDS_SUPPLEMENT).length;

    // Tính tiến độ hoàn thành tiêu chí từ 8 Fields của User trong Atlas DB
    let completedCriteriaCount = 0;
    let totalCriteriaCount = TOTAL_CRITERIA_COUNT;

    if (dbUser) {
      const userFields = await Field.find({ user: dbUser._id });
      if (userFields && userFields.length > 0) {
        let totalCrit = 0;
        let approvedCrit = 0;
        userFields.forEach((f) => {
          if (f.criteria) {
            totalCrit += f.criteria.length;
            approvedCrit += f.criteria.filter((c: any) => c.status === "approved").length;
          }
        });

        if (totalCrit > 0) {
          totalCriteriaCount = totalCrit;
          completedCriteriaCount = approvedCrit;
        }
      }
    }

    // Nếu không lấy được từ Field DB, đếm số tiêu chí độc lập có evidence Approved
    if (completedCriteriaCount === 0 && approvedCount > 0) {
      const approvedSet = new Set<string>();
      allTeacherEvidences.forEach((e) => {
        if (e.currentStatus === EvidenceStatus.APPROVED && e.criteriaName) {
          approvedSet.add(e.criteriaName);
        }
      });
      completedCriteriaCount = approvedSet.size;
    }

    const completionPercentage = Math.round((completedCriteriaCount / totalCriteriaCount) * 100);

    // Lọc tìm kiếm & trạng thái cho danh sách minh chứng
    let filteredEvidences = allTeacherEvidences.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery) ||
        item.evidenceId.toLowerCase().includes(searchQuery) ||
        item.standardName.toLowerCase().includes(searchQuery) ||
        item.criteriaName.toLowerCase().includes(searchQuery);

      const matchesStatus = statusFilter === "all" || item.currentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Phân trang backend
    const totalFiltered = filteredEvidences.length;
    const totalPages = Math.ceil(totalFiltered / limitNum) || 1;
    const paginatedEvidences = filteredEvidences.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return res.status(200).json({
      success: true,
      teacherInfo: {
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        departmentName: user.departmentName || "Tổng hợp",
      },
      summary: {
        totalSubmitted,
        approvedCount,
        pendingCount,
        needsSupplementCount,
        completedCriteriaCount,
        totalCriteriaCount,
        completionPercentage,
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalFiltered,
        totalPages,
      },
      evidences: paginatedEvidences,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi tải dữ liệu tổng quan giáo viên từ Atlas DB!",
      error: error.message,
    });
  }
});

/**
 * GET /api/evidences/my-evidences
 * Lấy riêng danh sách minh chứng sư phạm của giáo viên đang đăng nhập với phân trang backend (mặc định 10 tệp/trang)
 */
router.get("/my-evidences", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Chưa xác thực!" });
    }

    const pageNum = Math.max(1, parseInt(req.query.page as string) || 1);
    const limitNum = Math.max(1, parseInt(req.query.limit as string) || 10);
    const searchQuery = (req.query.search as string || "").trim().toLowerCase();
    const statusFilter = (req.query.status as string || "all").trim();

    let allTeacherEvidences: any[] = [];
    try {
      const dbUser = await User.findOne({
        $or: [
          { email: user.email.toLowerCase() },
          { userId: user.userId }
        ]
      });

      if (dbUser) {
        const dbEvidences = await Evidence.find({ submittedBy: dbUser._id })
          .sort({ date: -1, createdAt: -1 })
          .populate("submittedBy", "userId fullName email departmentName")
          .populate("fieldId", "fieldName fieldCode criteria");

        allTeacherEvidences = dbEvidences.map((e: any) => formatEvidenceItem(e, dbUser));
      }
    } catch {
      allTeacherEvidences = [];
    }

    if (allTeacherEvidences.length === 0) {
      allTeacherEvidences = inMemoryEvidences.filter(
        (e) =>
          (e.submittedBy?.userId && e.submittedBy.userId === user.userId) ||
          (e.submittedBy?.email && user.email && e.submittedBy.email.toLowerCase() === user.email.toLowerCase())
      );
    }

    // Lọc danh sách
    const filteredEvidences = allTeacherEvidences.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery) ||
        item.evidenceId.toLowerCase().includes(searchQuery) ||
        item.standardName.toLowerCase().includes(searchQuery) ||
        item.criteriaName.toLowerCase().includes(searchQuery);

      const matchesStatus = statusFilter === "all" || item.currentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });

    const totalFiltered = filteredEvidences.length;
    const totalPages = Math.ceil(totalFiltered / limitNum) || 1;
    const paginatedEvidences = filteredEvidences.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return res.status(200).json({
      success: true,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalFiltered,
        totalPages,
      },
      evidences: paginatedEvidences,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/evidences
 * Lấy danh sách minh chứng sư phạm
 */
router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    let formattedEvidences: any[] = [];
    try {
      const dbEvidences = await Evidence.find()
        .populate("submittedBy", "userId fullName email departmentName")
        .populate("fieldId", "fieldName fieldCode criteria");

      if (dbEvidences && dbEvidences.length > 0) {
        formattedEvidences = dbEvidences.map((e: any) => {
          let standardName = e.fieldId?.fieldName || "Tiêu chuẩn sư phạm";
          let criteriaName = "Tiêu chí sư phạm";

          if (e.fieldId && e.fieldId.criteria) {
            const crit = e.fieldId.criteria.find((c: any) => c._id.toString() === e.criterionId?.toString());
            if (crit) {
              criteriaName = `${crit.criteriaId}. ${crit.criteriaName}`;
            }
          }

          return {
            id: e._id.toString(),
            evidenceId: e.evidenceId,
            title: e.title,
            description: e.description || "",
            standardName,
            criteriaName,
            originalFileName: e.originalFileName,
            fileFormat: e.fileFormat,
            fileSize: e.fileSize,
            urlFile: ensureCorrectPublicUrl(e.urlFile),
            currentStatus: e.currentStatus,
            date: new Date(e.date).toISOString().split("T")[0],
            submittedBy: {
              userId: e.submittedBy?.userId || "USR-000",
              fullName: e.submittedBy?.fullName || "Giáo viên",
              email: e.submittedBy?.email || "",
              departmentName: e.submittedBy?.departmentName || "Tổng hợp",
            },
          };
        });
      }
    } catch {
      formattedEvidences = [];
    }

    if (formattedEvidences.length > 0) {
      return res.status(200).json({ success: true, evidences: formattedEvidences });
    }

    return res.status(200).json({
      success: true,
      evidences: inMemoryEvidences,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/evidences/stats
 * API phía Backend tổng hợp tất cả cán bộ/giáo viên trong hệ thống từ Atlas DB
 */
router.get("/stats", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    let allEvidences: any[] = [];
    try {
      const dbEvidences = await Evidence.find()
        .populate("submittedBy", "userId fullName email departmentName")
        .populate("fieldId", "fieldName fieldCode criteria");

      if (dbEvidences && dbEvidences.length > 0) {
        allEvidences = dbEvidences;
      }
    } catch {
      allEvidences = [];
    }

    if (allEvidences.length === 0) {
      allEvidences = inMemoryEvidences;
    }

    const totalSubmitted = allEvidences.length;
    const totalApproved = allEvidences.filter((e) => e.currentStatus === EvidenceStatus.APPROVED).length;
    const totalPending = allEvidences.filter((e) => e.currentStatus === EvidenceStatus.PENDING).length;
    const totalNeedsSupplement = allEvidences.filter((e) => e.currentStatus === EvidenceStatus.NEEDS_SUPPLEMENT).length;

    // Lấy tất cả giáo viên trong DB để tạo bảng tiến độ
    const teachers = await User.find({ role: UserRole.TEACHER });
    const teacherProgressList = [];

    for (const t of teachers) {
      const tEvidences = allEvidences.filter((e) => {
        if (e.submittedBy?._id) return e.submittedBy._id.toString() === t._id.toString();
        if (e.submittedBy?.email) return e.submittedBy.email.toLowerCase() === t.email.toLowerCase();
        return false;
      });

      const userFields = await Field.find({ user: t._id });
      let approvedCritCount = 0;
      let totalCritCount = TOTAL_CRITERIA_COUNT;

      if (userFields && userFields.length > 0) {
        let sumTotal = 0;
        let sumApproved = 0;
        userFields.forEach((f) => {
          if (f.criteria) {
            sumTotal += f.criteria.length;
            sumApproved += f.criteria.filter((c: any) => c.status === "approved").length;
          }
        });
        if (sumTotal > 0) {
          totalCritCount = sumTotal;
          approvedCritCount = sumApproved;
        }
      }

      const tApprovedCount = tEvidences.filter((e) => e.currentStatus === EvidenceStatus.APPROVED).length;
      if (approvedCritCount === 0 && tApprovedCount > 0) {
        approvedCritCount = tApprovedCount;
      }

      teacherProgressList.push({
        fullName: t.fullName,
        email: t.email,
        departmentName: t.departmentName || "Tổng hợp",
        totalSubmitted: tEvidences.length,
        approved: tApprovedCount,
        pending: tEvidences.filter((e) => e.currentStatus === EvidenceStatus.PENDING).length,
        needsSupplement: tEvidences.filter((e) => e.currentStatus === EvidenceStatus.NEEDS_SUPPLEMENT).length,
        completedCriteriaCount: approvedCritCount,
        totalCriteriaCount: totalCritCount,
        completionPercentage: Math.round((approvedCritCount / totalCritCount) * 100),
      });
    }

    return res.status(200).json({
      success: true,
      summary: {
        totalSubmitted,
        totalApproved,
        totalPending,
        totalNeedsSupplement,
        totalStandardCriteria: TOTAL_CRITERIA_COUNT,
      },
      teacherProgress: teacherProgressList,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi lấy thống kê minh chứng từ Atlas DB!",
      error: error.message,
    });
  }
});

/**
 * POST /api/evidences
 * Nộp minh chứng mới
 */
/**
 * POST /api/evidences
 * Nộp minh chứng mới và lưu tệp lên Cloudflare R2 theo cấu trúc thư mục:
 * id_người_dùng_hiện_tại-tên_người_dùng-role-môn_dạy / fieldCode / criteriaId / files
 */
router.post("/", authenticateToken, upload.array("files", 10), async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Chưa xác thực!" });
    }

    const { title, description, standardName, fieldCode, criteriaName, criteriaId } = req.body;
    const files = (req.files as Express.Multer.File[]) || [];

    const dbUser = await User.findOne({
      $or: [
        { email: user.email.toLowerCase() },
        { userId: user.userId }
      ]
    });

    const userInfoForR2 = dbUser ? {
      userId: dbUser.userId,
      fullName: dbUser.fullName,
      role: dbUser.role,
      major: dbUser.major || dbUser.departmentName,
    } : {
      userId: user.userId,
      fullName: user.fullName,
      role: user.role,
      major: user.departmentName,
    };

    let r2Result = {
      urlFile: "https://example.com/files/minhchung.pdf",
      fileNames: req.body.originalFileName || "minh_chung.pdf",
      fileFormats: req.body.fileFormat || "application/pdf",
      totalSize: Number(req.body.fileSize) || 1024000,
    };

    if (files.length > 0) {
      r2Result = await uploadFilesToR2(userInfoForR2, fieldCode || "I", criteriaId || "TC101", files);
    }

    if (dbUser) {
      let field = await Field.findOne({ user: dbUser._id, fieldName: standardName });
      if (!field && fieldCode) {
        field = await Field.findOne({ user: dbUser._id, fieldCode: fieldCode });
      }
      if (!field) {
        field = await Field.findOne({ user: dbUser._id });
      }

      let criterionId: any = new Types.ObjectId();
      if (field && field.criteria && field.criteria.length > 0) {
        const foundCrit = field.criteria.find((c: any) =>
          c.criteriaId === criteriaId || c.criteriaName === criteriaName || criteriaName?.includes(c.criteriaId)
        );
        if (foundCrit) {
          criterionId = (foundCrit as any)._id || criterionId;
          if (foundCrit.status === "incomplete") {
            foundCrit.status = "pending";
            await field.save();
          }
        } else {
          criterionId = (field.criteria[0] as any)._id || criterionId;
        }
      }

      const newEvidenceId = `MC-2026-${Date.now().toString().slice(-4)}`;
      const createdEv = await Evidence.create({
        evidenceId: newEvidenceId,
        title: title || "Minh chứng mới",
        description: description || "",
        date: new Date(),
        originalFileName: r2Result.fileNames,
        fileFormat: r2Result.fileFormats,
        fileSize: r2Result.totalSize,
        urlFile: r2Result.urlFile,
        currentStatus: EvidenceStatus.PENDING,
        submittedBy: dbUser._id,
        fieldId: field?._id,
        criterionId: criterionId,
      });

      if (!dbUser.evidences) dbUser.evidences = [];
      dbUser.evidences.push(createdEv._id as Types.ObjectId);
      await dbUser.save();

      const newEvFormatted = {
        id: createdEv._id.toString(),
        evidenceId: createdEv.evidenceId,
        title: createdEv.title,
        description: createdEv.description,
        standardName: field?.fieldName || standardName,
        criteriaName: criteriaName || "Tiêu chí mới",
        originalFileName: createdEv.originalFileName,
        fileFormat: createdEv.fileFormat,
        fileSize: createdEv.fileSize,
        urlFile: ensureCorrectPublicUrl(createdEv.urlFile),
        currentStatus: createdEv.currentStatus,
        date: new Date(createdEv.date).toISOString().split("T")[0],
        submittedBy: {
          userId: dbUser.userId,
          fullName: dbUser.fullName,
          email: dbUser.email,
          departmentName: dbUser.departmentName || "Tổng hợp",
        },
      };

      return res.status(201).json({
        success: true,
        message: "Nộp minh chứng lên Cloudflare R2 và MongoDB Atlas thành công!",
        evidence: newEvFormatted,
      });
    }

    // Fallback if dbUser not found
    const newId = `EV-${String(inMemoryEvidences.length + 1).padStart(3, "0")}`;
    const newEvidenceId = `MC-2026-${String(inMemoryEvidences.length + 1).padStart(3, "0")}`;

    const newEvidenceItem = {
      id: newId,
      evidenceId: newEvidenceId,
      title: title || "Minh chứng mới",
      description: description || "",
      standardName: standardName || "I. NĂNG LỰC SỬ DỤNG CÔNG NGHỆ SỐ",
      criteriaName: criteriaName || "TC101. Vận hành thiết bị số phục vụ công việc chuyên môn",
      originalFileName: r2Result.fileNames,
      fileFormat: r2Result.fileFormats,
      fileSize: r2Result.totalSize,
      urlFile: ensureCorrectPublicUrl(r2Result.urlFile),
      currentStatus: EvidenceStatus.PENDING,
      date: new Date().toISOString().split("T")[0],
      submittedBy: {
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        departmentName: user.departmentName || "Tổng hợp",
      },
    };

    inMemoryEvidences.unshift(newEvidenceItem);

    return res.status(201).json({
      success: true,
      message: "Nộp minh chứng lên Cloudflare R2 thành công!",
      evidence: newEvidenceItem,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PATCH /api/evidences/:id/status
 * Cập nhật trạng thái duyệt (Tổ trưởng / BGH)
 */
router.patch("/:id/status", authenticateToken, authorizeRoles(UserRole.DEPARTMENT_HEAD, UserRole.SCHOOL_BOARD), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reviewComment } = req.body;

    let dbEvidence = null;
    try {
      if (Types.ObjectId.isValid(id)) {
        dbEvidence = await Evidence.findById(id).populate("submittedBy").populate("fieldId");
      }
      if (!dbEvidence) {
        dbEvidence = await Evidence.findOne({ evidenceId: id }).populate("submittedBy").populate("fieldId");
      }
    } catch {
      dbEvidence = null;
    }

    if (dbEvidence) {
      dbEvidence.currentStatus = status;
      dbEvidence.reviewComment = reviewComment || "";
      await dbEvidence.save();

      // Cập nhật trạng thái tiêu chí tương ứng trong Field
      if (dbEvidence.fieldId && dbEvidence.criterionId) {
        const field = await Field.findById(dbEvidence.fieldId);
        if (field) {
          const criterion = field.criteria.find((c: any) => c._id.toString() === dbEvidence.criterionId.toString());
          if (criterion) {
            if (status === EvidenceStatus.APPROVED) {
              criterion.status = "approved";
            } else if (status === EvidenceStatus.NEEDS_SUPPLEMENT || status === EvidenceStatus.REJECTED) {
              criterion.status = "rejected";
            } else if (status === EvidenceStatus.PENDING) {
              criterion.status = "pending";
            }
            await field.save();
          }
        }
      }

      return res.status(200).json({
        success: true,
        message: "Cập nhật trạng thái thẩm định thành công trong MongoDB Atlas!",
        evidence: {
          id: dbEvidence._id.toString(),
          evidenceId: dbEvidence.evidenceId,
          currentStatus: dbEvidence.currentStatus,
          reviewComment: reviewComment || "",
        },
      });
    }

    const itemIndex = inMemoryEvidences.findIndex((e) => e.id === id || e.evidenceId === id);
    if (itemIndex !== -1) {
      inMemoryEvidences[itemIndex].currentStatus = status;
      inMemoryEvidences[itemIndex].reviewComment = reviewComment || inMemoryEvidences[itemIndex].reviewComment;

      return res.status(200).json({
        success: true,
        message: "Cập nhật trạng thái thẩm định thành công!",
        evidence: inMemoryEvidences[itemIndex],
      });
    }

    return res.status(404).json({ success: false, message: "Không tìm thấy hồ sơ minh chứng!" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * DELETE /api/evidences/:id
 * Xóa minh chứng
 */
router.delete("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;

    let dbEvidence = null;
    try {
      if (Types.ObjectId.isValid(id)) {
        dbEvidence = await Evidence.findById(id);
      }
      if (!dbEvidence) {
        dbEvidence = await Evidence.findOne({ evidenceId: id });
      }
    } catch {
      dbEvidence = null;
    }

    if (dbEvidence) {
      if (dbEvidence.fieldId && dbEvidence.criterionId) {
        const field = await Field.findById(dbEvidence.fieldId);
        if (field) {
          const criterion = field.criteria.find((c: any) => c._id.toString() === dbEvidence.criterionId.toString());
          if (criterion) {
            criterion.status = "incomplete";
            await field.save();
          }
        }
      }
      await Evidence.findByIdAndDelete(dbEvidence._id);

      const dbUser = await User.findById(user?.mongoId || user?.userId);
      if (dbUser && dbUser.evidences) {
        dbUser.evidences = dbUser.evidences.filter((evId: any) => evId.toString() !== dbEvidence!._id.toString());
        await dbUser.save();
      }

      return res.status(200).json({ success: true, message: "Xóa minh chứng thành công!" });
    }

    const itemIndex = inMemoryEvidences.findIndex((e) => e.id === id || e.evidenceId === id);
    if (itemIndex !== -1) {
      inMemoryEvidences.splice(itemIndex, 1);
      return res.status(200).json({ success: true, message: "Xóa minh chứng thành công!" });
    }

    return res.status(404).json({ success: false, message: "Không tìm thấy minh chứng để xóa!" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/evidences/:id
 * Chỉnh sửa / Bổ sung minh chứng
 */
router.put("/:id", authenticateToken, upload.array("files", 10), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const files = req.files as Express.Multer.File[];

    let dbEvidence = null;
    try {
      if (Types.ObjectId.isValid(id)) {
        dbEvidence = await Evidence.findById(id);
      }
      if (!dbEvidence) {
        dbEvidence = await Evidence.findOne({ evidenceId: id });
      }
    } catch {
      dbEvidence = null;
    }

    let r2Result = { fileNames: "", fileFormats: "", totalSize: 0, urlFile: "#" };
    if (files && files.length > 0) {
      r2Result = await uploadMultipleFilesToR2(files);
    }

    if (dbEvidence) {
      if (title) dbEvidence.title = title;
      if (description !== undefined) dbEvidence.description = description;
      dbEvidence.currentStatus = EvidenceStatus.PENDING;

      if (files && files.length > 0 && r2Result.urlFile !== "#") {
        dbEvidence.originalFileName = r2Result.fileNames;
        dbEvidence.fileFormat = r2Result.fileFormats;
        dbEvidence.fileSize = r2Result.totalSize;
        dbEvidence.urlFile = r2Result.urlFile;
      }

      await dbEvidence.save();

      if (dbEvidence.fieldId && dbEvidence.criterionId) {
        const field = await Field.findById(dbEvidence.fieldId);
        if (field) {
          const criterion = field.criteria.find((c: any) => c._id.toString() === dbEvidence.criterionId.toString());
          if (criterion) {
            criterion.status = "pending";
            await field.save();
          }
        }
      }

      return res.status(200).json({
        success: true,
        message: "Cập nhật minh chứng thành công!",
        evidence: {
          id: dbEvidence._id.toString(),
          evidenceId: dbEvidence.evidenceId,
          title: dbEvidence.title,
          description: dbEvidence.description,
          currentStatus: dbEvidence.currentStatus
        }
      });
    }

    const itemIndex = inMemoryEvidences.findIndex((e) => e.id === id || e.evidenceId === id);
    if (itemIndex !== -1) {
      if (title) inMemoryEvidences[itemIndex].title = title;
      if (description !== undefined) inMemoryEvidences[itemIndex].description = description;
      inMemoryEvidences[itemIndex].currentStatus = EvidenceStatus.PENDING;

      if (files && files.length > 0 && r2Result.urlFile !== "#") {
        inMemoryEvidences[itemIndex].originalFileName = r2Result.fileNames;
        inMemoryEvidences[itemIndex].fileFormat = r2Result.fileFormats;
        inMemoryEvidences[itemIndex].fileSize = r2Result.totalSize;
        inMemoryEvidences[itemIndex].urlFile = r2Result.urlFile;
      }

      return res.status(200).json({
        success: true,
        message: "Cập nhật minh chứng thành công!",
        evidence: inMemoryEvidences[itemIndex]
      });
    }

    return res.status(404).json({ success: false, message: "Không tìm thấy minh chứng để cập nhật!" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
