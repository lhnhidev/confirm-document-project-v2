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
import { FALLBACK_USERS } from "../db/seedUsersData.ts";
import { uploadFilesToR2, deleteFileFromR2 } from "../services/r2.service.ts";
const uploadMultipleFilesToR2 = uploadFilesToR2;

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Total criteria count from the 8 fields = 35
const TOTAL_CRITERIA_COUNT = FALLBACK_FIELDS.reduce((acc, f) => acc + f.criteria.length, 0);

// Sample initial in-memory evidences
let inMemoryEvidences: any[] = [
  
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

  const attachments = (e.attachments && e.attachments.length > 0)
    ? e.attachments.map((att: any) => ({
        name: att.name,
        url: ensureCorrectPublicUrl(att.url),
        format: att.format,
        size: att.size
      }))
    : (e.urlFile ? [{
        name: e.originalFileName || "Minh chứng",
        url: ensureCorrectPublicUrl(e.urlFile),
        format: e.fileFormat || "unknown",
        size: e.fileSize || 0
      }] : []);

  const comments = (e.comments && e.comments.length > 0)
    ? e.comments.map((comment: any) => ({
        id: comment._id ? comment._id.toString() : (comment.id || undefined),
        userId: comment.userId,
        userName: comment.userName || comment.fullName || "Người dùng",
        fullName: comment.fullName || comment.userName || "Người dùng",
        userRole: comment.userRole || comment.role || "Teacher",
        role: comment.role || comment.userRole || "Teacher",
        content: comment.content,
        createdAt: comment.createdAt ? new Date(comment.createdAt).toISOString() : new Date().toISOString()
      }))
    : [];

  return {
    id: e._id ? e._id.toString() : e.id,
    evidenceId: e.evidenceId,
    title: e.title,
    description: e.description || "",
    standardName,
    criteriaName,
    originalFileName: e.originalFileName || (attachments.length > 0 ? attachments.map((a: any) => a.name).join(", ") : ""),
    fileFormat: e.fileFormat || (attachments.length > 0 ? attachments[0].format : ""),
    fileSize: e.fileSize || (attachments.length > 0 ? attachments.reduce((acc: number, a: any) => acc + a.size, 0) : 0),
    urlFile: e.urlFile ? ensureCorrectPublicUrl(e.urlFile) : (attachments.length > 0 ? ensureCorrectPublicUrl(attachments[0].url) : "#"),
    currentStatus: e.currentStatus,
    date: e.date ? new Date(e.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    submittedBy: {
      userId: e.submittedBy?.userId || fallbackUser?.userId || "USR-002",
      fullName: e.submittedBy?.fullName || fallbackUser?.fullName || "Giáo viên",
      email: e.submittedBy?.email || fallbackUser?.email || "",
      departmentName: e.submittedBy?.departmentName || fallbackUser?.departmentName || "Tổng hợp",
      role: e.submittedBy?.role || fallbackUser?.role || "Teacher",
    },
    reviewComment: e.reviewComment || "",
    updatedAt: e.updatedAt ? new Date(e.updatedAt).toISOString() : new Date().toISOString(),
    attachments,
    comments,
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
    const startDate = (req.query.startDate as string || "").trim();
    const endDate = (req.query.endDate as string || "").trim();

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
        .populate("submittedBy", "userId fullName email departmentName role major")
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

    // Lọc tìm kiếm & trạng thái & khoảng thời gian cho danh sách minh chứng
    let filteredEvidences = allTeacherEvidences.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery) ||
        item.evidenceId.toLowerCase().includes(searchQuery) ||
        item.standardName.toLowerCase().includes(searchQuery) ||
        item.criteriaName.toLowerCase().includes(searchQuery);

      const matchesStatus = statusFilter === "all" || item.currentStatus === statusFilter;

      let matchesDate = true;
      if (item.date) {
        if (startDate) {
          matchesDate = matchesDate && (item.date >= startDate);
        }
        if (endDate) {
          matchesDate = matchesDate && (item.date <= endDate);
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
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
          .populate("submittedBy", "userId fullName email departmentName role major")
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
 * GET /api/evidences/my-supplement-count
 * Lấy riêng số lượng minh chứng yêu cầu bổ sung (NEEDS_SUPPLEMENT) của người dùng hiện tại
 */
router.get("/my-supplement-count", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Chưa xác thực người dùng!" });
    }

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
          .populate("submittedBy", "userId fullName email departmentName role major")
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

    const needsSupplementCount = allTeacherEvidences.filter(
      (e) => e.currentStatus === EvidenceStatus.NEEDS_SUPPLEMENT
    ).length;

    return res.status(200).json({
      success: true,
      needsSupplementCount,
      totalSubmitted: allTeacherEvidences.length
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi lấy số lượng minh chứng cần bổ sung!",
      error: error.message
    });
  }
});

/**
 * GET /api/evidences/leaders
 * Lấy danh sách minh chứng sư phạm của Tổ trưởng & Tổ phó dành cho Ban Giám Hiệu phê duyệt, hỗ trợ tìm kiếm, lọc và phân trang (mặc định 10 items/trang)
 */
router.get("/leaders", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const pageNum = Math.max(1, parseInt(req.query.page as string) || 1);
    const limitNum = Math.max(1, parseInt(req.query.limit as string) || 10);
    const searchQuery = (req.query.search as string || "").trim().toLowerCase();
    const departmentFilter = (req.query.department as string || "all").trim();
    const statusFilter = (req.query.status as string || "all").trim();
    const roleFilter = (req.query.role as string || "all").trim();

    let allLeaderEvidences: any[] = [];

    try {
      // Find all users who are DEPARTMENT_HEAD or DEPARTMENT_VICE_HEAD
      const leaderUsers = await User.find({
        role: { $in: [UserRole.DEPARTMENT_HEAD, UserRole.DEPARTMENT_VICE_HEAD] }
      });

      const leaderUserIds = leaderUsers.map((u) => u._id);

      const dbEvidences = await Evidence.find({
        submittedBy: { $in: leaderUserIds }
      })
        .sort({ date: -1, createdAt: -1 })
        .populate("submittedBy", "userId fullName email departmentName role major")
        .populate("fieldId", "fieldName fieldCode criteria");

      if (dbEvidences && dbEvidences.length > 0) {
        allLeaderEvidences = dbEvidences.map((e: any) => formatEvidenceItem(e));
      }
    } catch (err) {
      console.error("Lỗi khi truy vấn minh chứng Tổ trưởng/Tổ phó từ Atlas:", err);
      allLeaderEvidences = [];
    }

    // Fallback if empty
    if (allLeaderEvidences.length === 0) {
      allLeaderEvidences = inMemoryEvidences.filter(
        (e) =>
          e.submittedBy?.role === UserRole.DEPARTMENT_HEAD ||
          e.submittedBy?.role === UserRole.DEPARTMENT_VICE_HEAD ||
          e.submittedBy?.role === "DEPARTMENT_HEAD" ||
          e.submittedBy?.role === "DEPARTMENT_VICE_HEAD"
      );
    }

    // Calculate Summary Stats for Leader Evidences
    const totalSubmitted = allLeaderEvidences.length;
    const pendingCount = allLeaderEvidences.filter((e) => e.currentStatus === EvidenceStatus.PENDING).length;
    const approvedCount = allLeaderEvidences.filter((e) => e.currentStatus === EvidenceStatus.APPROVED).length;
    const needsSupplementCount = allLeaderEvidences.filter((e) => e.currentStatus === EvidenceStatus.NEEDS_SUPPLEMENT).length;
    
    // Unique leader contributors
    const leaderSet = new Set<string>();
    allLeaderEvidences.forEach((e) => {
      if (e.submittedBy?.userId) leaderSet.add(e.submittedBy.userId);
    });
    const totalLeaders = leaderSet.size;

    // Filter by search, department, status, and role
    const filteredEvidences = allLeaderEvidences.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery) ||
        item.evidenceId.toLowerCase().includes(searchQuery) ||
        item.submittedBy.fullName.toLowerCase().includes(searchQuery) ||
        item.submittedBy.email.toLowerCase().includes(searchQuery) ||
        item.submittedBy.departmentName.toLowerCase().includes(searchQuery) ||
        item.standardName.toLowerCase().includes(searchQuery) ||
        item.criteriaName.toLowerCase().includes(searchQuery);

      const matchesDept =
        departmentFilter === "all" ||
        item.submittedBy.departmentName === departmentFilter ||
        item.submittedBy.departmentName.toLowerCase() === departmentFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        item.currentStatus === statusFilter;

      const matchesRole =
        roleFilter === "all" ||
        item.submittedBy.role === roleFilter;

      return matchesSearch && matchesDept && matchesStatus && matchesRole;
    });

    // Pagination
    const totalFiltered = filteredEvidences.length;
    const totalPages = Math.ceil(totalFiltered / limitNum) || 1;
    const paginatedEvidences = filteredEvidences.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return res.status(200).json({
      success: true,
      summary: {
        totalSubmitted,
        pendingCount,
        approvedCount,
        needsSupplementCount,
        totalLeaders,
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
      message: "Lỗi hệ thống khi lấy danh sách minh chứng của Tổ trưởng & Tổ phó!",
      error: error.message,
    });
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
        .sort({ date: -1, createdAt: -1 })
        .populate("submittedBy", "userId fullName email departmentName role major")
        .populate("fieldId", "fieldName fieldCode criteria");

      if (dbEvidences && dbEvidences.length > 0) {
        formattedEvidences = dbEvidences.map((e: any) => formatEvidenceItem(e));
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
 * API phía Backend tổng hợp tất cả cán bộ/giáo viên và tiến độ thẩm định chính xác theo từng Tổ Chuyên Môn từ Atlas DB
 */
router.get("/stats", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    let allEvidences: any[] = [];
    try {
      const dbEvidences = await Evidence.find()
        .populate("submittedBy", "userId fullName email departmentName role major")
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

    // Lấy danh sách toàn bộ người dùng trong DB (hoặc fallback)
    let allUsers: any[] = [];
    try {
      allUsers = await User.find();
    } catch {
      allUsers = [];
    }
    if (!allUsers || allUsers.length === 0) {
      allUsers = FALLBACK_USERS as any;
    }

    const totalSubmitted = allEvidences.length;
    const totalApproved = allEvidences.filter((e) => e.currentStatus === EvidenceStatus.APPROVED).length;
    const totalPending = allEvidences.filter((e) => e.currentStatus === EvidenceStatus.PENDING).length;
    const totalNeedsSupplement = allEvidences.filter((e) => e.currentStatus === EvidenceStatus.NEEDS_SUPPLEMENT).length;

    // Danh sách cán bộ/giáo viên (loại trừ Ban Giám Hiệu nếu cần)
    const teachersAndStaff = allUsers.filter(
      (u) => u.role !== UserRole.PRINCIPAL && u.role !== UserRole.VICE_PRINCIPAL && u.role !== UserRole.SCHOOL_BOARD
    );

    // 1. Tính toán tiến độ từng giáo viên (teacherProgress)
    const teacherProgressList: any[] = [];
    for (const t of teachersAndStaff) {
      const tEvidences = allEvidences.filter((e) => {
        if (e.submittedBy?._id && t._id && e.submittedBy._id.toString() === t._id.toString()) return true;
        if (e.submittedBy?.email && t.email && e.submittedBy.email.toLowerCase() === t.email.toLowerCase()) return true;
        if (e.submittedBy?.userId && t.userId && e.submittedBy.userId === t.userId) return true;
        return false;
      });

      let approvedCritCount = 0;
      let totalCritCount = TOTAL_CRITERIA_COUNT;

      try {
        if (t._id) {
          const userFields = await Field.find({ user: t._id });
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
        }
      } catch {
        // ignore field fetch error
      }

      // Đếm số tiêu chí đã có minh chứng được duyệt nếu chưa có Field records
      const tApprovedEvidences = tEvidences.filter((e) => e.currentStatus === EvidenceStatus.APPROVED);
      const uniqueApprovedCriteria = new Set<string>();
      tApprovedEvidences.forEach((e) => {
        if (e.criteriaId) {
          uniqueApprovedCriteria.add(e.criteriaId.toString());
        } else if (e.fieldId) {
          uniqueApprovedCriteria.add(e.fieldId.toString());
        } else {
          uniqueApprovedCriteria.add(e._id ? e._id.toString() : e.title);
        }
      });

      if (approvedCritCount === 0 && uniqueApprovedCriteria.size > 0) {
        approvedCritCount = uniqueApprovedCriteria.size;
      }

      const completionPercentage = totalCritCount > 0
        ? Math.min(100, Math.round((approvedCritCount / totalCritCount) * 100))
        : (approvedCritCount > 0 ? 100 : 0);

      teacherProgressList.push({
        userId: t.userId,
        fullName: t.fullName,
        email: t.email,
        role: t.role,
        major: t.major,
        departmentName: t.departmentName || "Tổ Tổng Hợp",
        totalSubmitted: tEvidences.length,
        approved: tApprovedEvidences.length,
        pending: tEvidences.filter((e) => e.currentStatus === EvidenceStatus.PENDING).length,
        needsSupplement: tEvidences.filter((e) => e.currentStatus === EvidenceStatus.NEEDS_SUPPLEMENT).length,
        completedCriteriaCount: approvedCritCount,
        totalCriteriaCount: totalCritCount,
        completionPercentage,
      });
    }

    // Helper chuẩn hóa tên tổ
    const normalizeDeptName = (dept?: string) => {
      if (!dept) return "Tổ Tổng Hợp";
      const s = dept.trim().toLowerCase();
      if (s.includes("tự nhiên") || s.includes("tu nhien")) return "Tổ Tự Nhiên";
      if (s.includes("xã hội") || s.includes("xa hoi")) return "Tổ Xã Hội";
      if (s.includes("ngoại ngữ") || s.includes("ngoai ngu")) return "Tổ Ngoại Ngữ";
      if (s.includes("tổng hợp") || s.includes("tong hop")) return "Tổ Tổng Hợp";
      return dept.trim();
    };

    // 2. Tính toán chính xác tiến độ theo từng Tổ Chuyên Môn (departmentProgress)
    const standardDepts = ["Tổ Tự Nhiên", "Tổ Xã Hội", "Tổ Tổng Hợp", "Tổ Ngoại Ngữ"];
    const presentDepts = new Set<string>(standardDepts);
    allUsers.forEach((u) => {
      if (u.departmentName && u.role !== UserRole.PRINCIPAL && u.role !== UserRole.VICE_PRINCIPAL && u.role !== UserRole.SCHOOL_BOARD) {
        presentDepts.add(normalizeDeptName(u.departmentName));
      }
    });

    const departmentProgressList = Array.from(presentDepts).map((deptName) => {
      // Danh sách thành viên trong tổ
      const deptMembers = allUsers.filter(
        (u) => normalizeDeptName(u.departmentName) === deptName &&
               u.role !== UserRole.PRINCIPAL &&
               u.role !== UserRole.VICE_PRINCIPAL &&
               u.role !== UserRole.SCHOOL_BOARD
      );

      // Tổ trưởng & Tổ phó
      const headUser = deptMembers.find((u) => u.role === UserRole.DEPARTMENT_HEAD);
      const viceHeadUser = deptMembers.find((u) => u.role === UserRole.DEPARTMENT_VICE_HEAD);

      const headName = headUser?.fullName || (viceHeadUser ? `${viceHeadUser.fullName} (Quyền Tổ trưởng)` : "Chưa phân công");
      const viceHeadName = viceHeadUser?.fullName || "";

      // Minh chứng của tổ (do các thành viên trong tổ nộp)
      const deptEvidences = allEvidences.filter((e) => {
        const evDept = normalizeDeptName(e.submittedBy?.departmentName);
        if (evDept === deptName) return true;
        if (e.submittedBy?._id && deptMembers.some((m) => m._id && m._id.toString() === e.submittedBy._id.toString())) return true;
        if (e.submittedBy?.email && deptMembers.some((m) => m.email.toLowerCase() === e.submittedBy.email.toLowerCase())) return true;
        return false;
      });

      const approvedCount = deptEvidences.filter((e) => e.currentStatus === EvidenceStatus.APPROVED).length;
      const pendingCount = deptEvidences.filter((e) => e.currentStatus === EvidenceStatus.PENDING).length;
      const needsSupplementCount = deptEvidences.filter((e) => e.currentStatus === EvidenceStatus.NEEDS_SUPPLEMENT).length;
      const deptTotalSubmitted = deptEvidences.length;

      // Tiến độ tiêu chí của các giáo viên trong tổ
      const deptTeacherStats = teacherProgressList.filter((t) => normalizeDeptName(t.departmentName) === deptName);
      
      let completionRate = 0;
      if (deptTeacherStats.length > 0) {
        const sumPercentage = deptTeacherStats.reduce((acc, t) => acc + t.completionPercentage, 0);
        completionRate = Math.round(sumPercentage / deptTeacherStats.length);
      } else if (deptTotalSubmitted > 0) {
        completionRate = Math.round((approvedCount / deptTotalSubmitted) * 100);
      }

      return {
        name: deptName,
        headName,
        viceHeadName,
        teacherCount: deptMembers.length,
        approvedCount,
        pendingCount,
        needsSupplementCount,
        totalSubmitted: deptTotalSubmitted,
        completionRate: Math.min(100, Math.max(0, completionRate)),
      };
    });

    // Sắp xếp thứ tự tổ chuyên môn
    const deptOrder = ["Tổ Tự Nhiên", "Tổ Xã Hội", "Tổ Tổng Hợp", "Tổ Ngoại Ngữ"];
    departmentProgressList.sort((a, b) => {
      const idxA = deptOrder.indexOf(a.name);
      const idxB = deptOrder.indexOf(b.name);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });

    // 3. Tính toán số liệu tổng quan toàn trường (schoolOverview)
    const leaderPendingCount = allEvidences.filter((e) => {
      const role = e.submittedBy?.role;
      const isLeader = role === UserRole.DEPARTMENT_HEAD || role === UserRole.DEPARTMENT_VICE_HEAD;
      return isLeader && e.currentStatus === EvidenceStatus.PENDING;
    }).length;

    const overallCompletionRate = teacherProgressList.length > 0
      ? Math.round(teacherProgressList.reduce((acc, t) => acc + t.completionPercentage, 0) / teacherProgressList.length)
      : 0;

    return res.status(200).json({
      success: true,
      summary: {
        totalSubmitted,
        totalApproved,
        totalPending,
        totalNeedsSupplement,
        totalStandardCriteria: TOTAL_CRITERIA_COUNT,
        totalTeachers: teachersAndStaff.length,
        overallCompletionRate,
        leaderPending: leaderPendingCount,
      },
      departmentProgress: departmentProgressList,
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

    const { title, description, standardName, fieldCode, criteriaName, criteriaId, uploadType, evidenceLink } = req.body;
    const files = (req.files as Express.Multer.File[]) || [];

    // Enforce 5MB total file size limit
    const maxSizeBytes = 5 * 1024 * 1024;
    const totalFilesSize = files.reduce((acc, f) => acc + f.size, 0);
    if (totalFilesSize > maxSizeBytes) {
      return res.status(400).json({
        success: false,
        message: "Tổng kích thước tệp tải lên vượt quá giới hạn 5MB!",
      });
    }

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

    const parsedLinks: string[] = [];
    if (evidenceLink && evidenceLink.trim()) {
      parsedLinks.push(evidenceLink.trim());
    }
    if (req.body.links) {
      try {
        const temp = JSON.parse(req.body.links);
        if (Array.isArray(temp)) {
          temp.forEach((l: any) => {
            if (typeof l === "string" && l.trim()) parsedLinks.push(l.trim());
          });
        }
      } catch {
        if (typeof req.body.links === "string" && req.body.links.trim()) {
          parsedLinks.push(req.body.links.trim());
        } else if (Array.isArray(req.body.links)) {
          req.body.links.forEach((l: any) => {
            if (typeof l === "string" && l.trim()) parsedLinks.push(l.trim());
          });
        }
      }
    }

    let uploadedFiles: { name: string; url: string; format: string; size: number }[] = [];
    let legacyResult = {
      urlFile: "https://example.com/files/minhchung.pdf",
      fileNames: "minh_chung.pdf",
      fileFormats: "application/pdf",
      totalSize: 1024000,
    };

    if (files.length > 0) {
      const uploadRes = await uploadFilesToR2(userInfoForR2, fieldCode || "I", criteriaId || "TC101", files);
      uploadedFiles = uploadRes.uploadedFiles || [];
      legacyResult = {
        urlFile: uploadRes.urlFile,
        fileNames: uploadRes.fileNames,
        fileFormats: uploadRes.fileFormats,
        totalSize: uploadRes.totalSize,
      };
    }

    const fileAttachments = uploadedFiles.map(f => ({
      name: f.name,
      url: f.url,
      format: f.format,
      size: f.size,
    }));

    const linkAttachments = parsedLinks.map(link => {
      let hostname = "Liên kết ngoài";
      try {
        const urlObj = new URL(link);
        hostname = `Liên kết (${urlObj.hostname})`;
      } catch {
        // ignore
      }
      return {
        name: hostname,
        url: link,
        format: "url",
        size: 0,
      };
    });

    const finalAttachments = [...fileAttachments, ...linkAttachments];
    if (finalAttachments.length === 0) {
      finalAttachments.push({
        name: "Liên kết ngoài",
        url: evidenceLink || "https://example.com",
        format: "url",
        size: 0,
      });
    }

    const primaryAttachment = finalAttachments[0];
    const legacyUrl = primaryAttachment.url;
    const legacyFileName = finalAttachments.map(a => a.name).join(", ");
    const legacyFormat = primaryAttachment.format;
    const legacySize = finalAttachments.reduce((acc, a) => acc + (a.size || 0), 0);

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
        originalFileName: legacyFileName,
        fileFormat: legacyFormat,
        fileSize: legacySize,
        urlFile: legacyUrl,
        attachments: finalAttachments,
        currentStatus: EvidenceStatus.PENDING,
        submittedBy: dbUser._id,
        fieldId: field?._id,
        criterionId: criterionId,
      });

      if (!dbUser.evidences) dbUser.evidences = [];
      dbUser.evidences.push(createdEv._id as Types.ObjectId);
      await dbUser.save();

      const newEvFormatted = formatEvidenceItem(createdEv, dbUser);

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
      originalFileName: legacyFileName,
      fileFormat: legacyFormat,
      fileSize: legacySize,
      urlFile: ensureCorrectPublicUrl(legacyUrl),
      attachments: finalAttachments,
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
router.patch("/:id/status", authenticateToken, authorizeRoles(UserRole.DEPARTMENT_HEAD, UserRole.DEPARTMENT_VICE_HEAD, UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL, UserRole.SCHOOL_BOARD), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reviewComment } = req.body;

    let dbEvidence = null;
    try {
      if (typeof id === "string" && Types.ObjectId.isValid(id)) {
        dbEvidence = await Evidence.findById(id).populate("submittedBy").populate("fieldId");
      }
      if (!dbEvidence) {
        dbEvidence = await Evidence.findOne({ evidenceId: id }).populate("submittedBy").populate("fieldId");
      }
    } catch {
      dbEvidence = null;
    }

    if (dbEvidence) {
      const reviewer = req.user!;
      const submitter: any = dbEvidence.submittedBy;

      if (submitter) {
        const isSelf =
          submitter.userId === reviewer.userId ||
          (submitter.email && reviewer.email && submitter.email.toLowerCase() === reviewer.email.toLowerCase());

        if (isSelf) {
          return res.status(403).json({
            success: false,
            message: "Bạn không thể tự phê duyệt hoặc yêu cầu bổ sung cho chính minh chứng của mình!",
          });
        }

        const seniorRoles = [UserRole.PRINCIPAL, UserRole.VICE_PRINCIPAL, UserRole.SCHOOL_BOARD];
        const departmentLeadRoles = [UserRole.DEPARTMENT_HEAD, UserRole.DEPARTMENT_VICE_HEAD];

        if (departmentLeadRoles.includes(submitter.role) && !seniorRoles.includes(reviewer.role)) {
          return res.status(403).json({
            success: false,
            message: "Minh chứng của Tổ trưởng/Tổ phó chỉ có Hiệu trưởng hoặc Hiệu phó mới được phê duyệt!",
          });
        }
      }

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
      if (typeof id === "string" && Types.ObjectId.isValid(id)) {
        dbEvidence = await Evidence.findById(id);
      }
      if (!dbEvidence) {
        dbEvidence = await Evidence.findOne({ evidenceId: id });
      }
    } catch {
      dbEvidence = null;
    }

    if (dbEvidence) {
      if (dbEvidence.urlFile) {
        await deleteFileFromR2(dbEvidence.urlFile);
      }

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

      const dbUser = await User.findOne({
        $or: [
          { userId: user?.userId },
          { email: user?.email }
        ]
      });
      if (dbUser && dbUser.evidences) {
        dbUser.evidences = dbUser.evidences.filter((evId: any) => evId.toString() !== dbEvidence!._id.toString());
        await dbUser.save();
      }

      return res.status(200).json({ success: true, message: "Xóa minh chứng và tệp lưu trữ R2 thành công!" });
    }

    const itemIndex = inMemoryEvidences.findIndex((e) => e.id === id || e.evidenceId === id);
    if (itemIndex !== -1) {
      const target = inMemoryEvidences[itemIndex];
      if (target && target.urlFile) {
        await deleteFileFromR2(target.urlFile);
      }
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
    const { title, description, uploadType, evidenceLink } = req.body;
    const files = req.files as Express.Multer.File[];

    // Enforce 5MB total file size limit for new files
    const maxSizeBytes = 5 * 1024 * 1024;
    const totalFilesSize = files ? files.reduce((acc, f) => acc + f.size, 0) : 0;
    if (totalFilesSize > maxSizeBytes) {
      return res.status(400).json({
        success: false,
        message: "Tổng kích thước tệp tải lên vượt quá giới hạn 5MB!",
      });
    }

    let dbEvidence = null;
    try {
      if (typeof id === "string" && Types.ObjectId.isValid(id)) {
        dbEvidence = await Evidence.findById(id);
      }
      if (!dbEvidence) {
        dbEvidence = await Evidence.findOne({ evidenceId: id });
      }
    } catch {
      dbEvidence = null;
    }

    const parsedLinks: string[] = [];
    if (evidenceLink && evidenceLink.trim()) {
      parsedLinks.push(evidenceLink.trim());
    }
    if (req.body.links) {
      try {
        const temp = JSON.parse(req.body.links);
        if (Array.isArray(temp)) {
          temp.forEach((l: any) => {
            if (typeof l === "string" && l.trim()) parsedLinks.push(l.trim());
          });
        }
      } catch {
        if (typeof req.body.links === "string" && req.body.links.trim()) {
          parsedLinks.push(req.body.links.trim());
        } else if (Array.isArray(req.body.links)) {
          req.body.links.forEach((l: any) => {
            if (typeof l === "string" && l.trim()) parsedLinks.push(l.trim());
          });
        }
      }
    }

    let uploadedFiles: { name: string; url: string; format: string; size: number }[] = [];
    if (files && files.length > 0) {
      const user = req.user;
      const userInfoForR2 = {
        userId: user?.userId || "USR-001",
        fullName: user?.fullName || "User",
        role: user?.role || UserRole.TEACHER,
        major: user?.major || user?.departmentName || "General",
      };
      let fieldCode = req.body.fieldCode || "I";
      let criteriaIdStr = req.body.criteriaId || "TC101";
      if (dbEvidence?.fieldId) {
        const f = await Field.findById(dbEvidence.fieldId);
        if (f) fieldCode = f.fieldCode;
      }
      if (dbEvidence?.criterionId) {
        criteriaIdStr = dbEvidence.criterionId.toString();
      }
      const uploadRes = await uploadFilesToR2(
        userInfoForR2,
        fieldCode,
        criteriaIdStr,
        files
      );
      uploadedFiles = uploadRes.uploadedFiles || [];
    }

    // Parse existing attachments to keep
    let existingAttachments: any[] = [];
    let hasExistingAttachmentsField = false;
    if (req.body.existingAttachments) {
      hasExistingAttachmentsField = true;
      try {
        const parsed = JSON.parse(req.body.existingAttachments);
        if (Array.isArray(parsed)) {
          existingAttachments = parsed;
        }
      } catch {
        // ignore
      }
    }

    // Construct final list of attachments
    let finalAttachments = dbEvidence ? dbEvidence.attachments || [] : [];
    if (files?.length > 0 || parsedLinks.length > 0 || hasExistingAttachmentsField) {
      const fileAttachments = uploadedFiles.map(f => ({
        name: f.name,
        url: f.url,
        format: f.format,
        size: f.size,
      }));

      const linkAttachments = parsedLinks.map(link => {
        let hostname = "Liên kết ngoài";
        try {
          const urlObj = new URL(link);
          hostname = `Liên kết (${urlObj.hostname})`;
        } catch {
          // ignore
        }
        return {
          name: hostname,
          url: link,
          format: "url",
          size: 0,
        };
      });

      finalAttachments = [...existingAttachments, ...fileAttachments, ...linkAttachments];
    }

    if (finalAttachments.length === 0 && dbEvidence) {
      finalAttachments = dbEvidence.attachments && dbEvidence.attachments.length > 0
        ? dbEvidence.attachments
        : (dbEvidence.urlFile ? [{
            name: dbEvidence.originalFileName || "Minh chứng",
            url: dbEvidence.urlFile,
            format: dbEvidence.fileFormat || "unknown",
            size: dbEvidence.fileSize || 0
          }] : []);
    }

    if (dbEvidence) {
      if (title) dbEvidence.title = title;
      if (description !== undefined) dbEvidence.description = description;
      dbEvidence.currentStatus = EvidenceStatus.PENDING;

      if (finalAttachments.length > 0) {
        dbEvidence.attachments = finalAttachments;
        const primary = finalAttachments[0];
        dbEvidence.originalFileName = finalAttachments.map(a => a.name).join(", ");
        dbEvidence.fileFormat = primary.format;
        dbEvidence.fileSize = finalAttachments.reduce((acc, a) => acc + (a.size || 0), 0);
        dbEvidence.urlFile = primary.url;
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

      const updatedEvFormatted = formatEvidenceItem(dbEvidence);

      return res.status(200).json({
        success: true,
        message: "Cập nhật minh chứng thành công!",
        evidence: updatedEvFormatted
      });
    }

    const itemIndex = inMemoryEvidences.findIndex((e) => e.id === id || e.evidenceId === id);
    if (itemIndex !== -1) {
      if (title) inMemoryEvidences[itemIndex].title = title;
      if (description !== undefined) inMemoryEvidences[itemIndex].description = description;
      inMemoryEvidences[itemIndex].currentStatus = EvidenceStatus.PENDING;

      if (finalAttachments.length > 0) {
        inMemoryEvidences[itemIndex].attachments = finalAttachments;
        const primary = finalAttachments[0];
        inMemoryEvidences[itemIndex].originalFileName = finalAttachments.map(a => a.name).join(", ");
        inMemoryEvidences[itemIndex].fileFormat = primary.format;
        inMemoryEvidences[itemIndex].fileSize = finalAttachments.reduce((acc, a) => acc + (a.size || 0), 0);
        inMemoryEvidences[itemIndex].urlFile = primary.url;
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

/**
 * POST /api/evidences/:id/comments
 * Thêm một nhận xét / phản hồi mới vào minh chứng
 */
router.post("/:id/comments", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const user = req.user;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Nội dung nhận xét không được để trống!" });
    }

    const dbUser = await User.findOne({
      $or: [
        { userId: user?.userId },
        { email: user?.email }
      ]
    });

    const commenterName = dbUser?.fullName || user?.fullName || "Người dùng";
    const commenterRole = dbUser?.role || user?.role || "Teacher";
    const commenterId = dbUser?.userId || user?.userId || "USR-UNKNOWN";

    const newComment = {
      userId: commenterId,
      userName: commenterName,
      userRole: commenterRole,
      content: content.trim(),
      createdAt: new Date(),
    };

    let dbEvidence = null;
    try {
      if (typeof id === "string" && Types.ObjectId.isValid(id)) {
        dbEvidence = await Evidence.findById(id).populate("submittedBy");
      }
      if (!dbEvidence) {
        dbEvidence = await Evidence.findOne({ evidenceId: id }).populate("submittedBy");
      }
    } catch {
      dbEvidence = null;
    }

    if (dbEvidence) {
      if (!dbEvidence.comments) {
        dbEvidence.comments = [];
      }
      dbEvidence.comments.push(newComment);
      await dbEvidence.save();

      const formatted = formatEvidenceItem(dbEvidence);
      return res.status(200).json({
        success: true,
        message: "Gửi phản hồi thành công!",
        evidence: formatted,
      });
    }

    // fallback in-memory database
    const itemIndex = inMemoryEvidences.findIndex((e) => e.id === id || e.evidenceId === id);
    if (itemIndex !== -1) {
      const memoryEv = inMemoryEvidences[itemIndex];
      if (!memoryEv.comments) {
        memoryEv.comments = [];
      }
      
      const newMemoryComment = {
        id: "cmt-" + Date.now(),
        userId: commenterId,
        userName: commenterName,
        userRole: commenterRole,
        content: content.trim(),
        createdAt: new Date().toISOString()
      };
      memoryEv.comments.push(newMemoryComment);

      return res.status(200).json({
        success: true,
        message: "Gửi phản hồi thành công!",
        evidence: memoryEv,
      });
    }

    return res.status(404).json({ success: false, message: "Không tìm thấy minh chứng để nhận xét!" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * DELETE /api/evidences/:id/comments/:commentId
 * Thu hồi một nhận xét / phản hồi (chỉ trong vòng 1 giờ và phải là chính chủ)
 */
router.delete("/:id/comments/:commentId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id, commentId } = req.params;
    const user = req.user;

    const dbUser = await User.findOne({
      $or: [
        { userId: user?.userId },
        { email: user?.email }
      ]
    });
    const commenterId = dbUser?.userId || user?.userId || "USR-UNKNOWN";

    let dbEvidence = null;
    try {
      if (typeof id === "string" && Types.ObjectId.isValid(id)) {
        dbEvidence = await Evidence.findById(id).populate("submittedBy");
      }
      if (!dbEvidence) {
        dbEvidence = await Evidence.findOne({ evidenceId: id }).populate("submittedBy");
      }
    } catch {
      dbEvidence = null;
    }

    if (dbEvidence) {
      if (!dbEvidence.comments || dbEvidence.comments.length === 0) {
        return res.status(404).json({ success: false, message: "Không tìm thấy phản hồi để thu hồi!" });
      }

      const commentIndex = dbEvidence.comments.findIndex((c: any) => {
        const cid = c._id ? c._id.toString() : (c.id || undefined);
        return cid === commentId;
      });

      if (commentIndex === -1) {
        return res.status(404).json({ success: false, message: "Không tìm thấy phản hồi để thu hồi!" });
      }

      const targetComment = dbEvidence.comments[commentIndex];

      if (targetComment.userId !== commenterId) {
        return res.status(403).json({ success: false, message: "Bạn không thể thu hồi nhận xét của người khác!" });
      }

      const commentTime = new Date(targetComment.createdAt).getTime();
      const currentTime = Date.now();
      const diffInMs = currentTime - commentTime;
      const oneHourInMs = 60 * 60 * 1000;

      if (diffInMs > oneHourInMs) {
        return res.status(400).json({ success: false, message: "Đã quá 1 giờ kể từ khi gửi, không thể thu hồi phản hồi này!" });
      }

      dbEvidence.comments.splice(commentIndex, 1);
      await dbEvidence.save();

      const formatted = formatEvidenceItem(dbEvidence);
      return res.status(200).json({
        success: true,
        message: "Thu hồi phản hồi thành công!",
        evidence: formatted,
      });
    }

    const itemIndex = inMemoryEvidences.findIndex((e) => e.id === id || e.evidenceId === id);
    if (itemIndex !== -1) {
      const memoryEv = inMemoryEvidences[itemIndex];
      if (!memoryEv.comments || memoryEv.comments.length === 0) {
        return res.status(404).json({ success: false, message: "Không tìm thấy phản hồi để thu hồi!" });
      }

      const commentIndex = memoryEv.comments.findIndex((c: any) => {
        const cid = c._id ? c._id.toString() : (c.id || undefined);
        return cid === commentId;
      });

      if (commentIndex === -1) {
        return res.status(404).json({ success: false, message: "Không tìm thấy phản hồi để thu hồi!" });
      }

      const targetComment = memoryEv.comments[commentIndex];

      if (targetComment.userId !== commenterId) {
        return res.status(403).json({ success: false, message: "Bạn không thể thu hồi nhận xét của người khác!" });
      }

      const commentTime = new Date(targetComment.createdAt).getTime();
      const currentTime = Date.now();
      const diffInMs = currentTime - commentTime;
      const oneHourInMs = 60 * 60 * 1000;

      if (diffInMs > oneHourInMs) {
        return res.status(400).json({ success: false, message: "Đã quá 1 giờ kể từ khi gửi, không thể thu hồi phản hồi này!" });
      }

      memoryEv.comments.splice(commentIndex, 1);

      return res.status(200).json({
        success: true,
        message: "Thu hồi phản hồi thành công!",
        evidence: memoryEv,
      });
    }

    return res.status(404).json({ success: false, message: "Không tìm thấy minh chứng để thu hồi nhận xét!" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
