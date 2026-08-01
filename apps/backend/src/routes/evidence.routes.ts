import { Router, type Response } from "express";
import { Types } from "mongoose";
import { Evidence, EvidenceStatus } from "../models/evidence.model.ts";
import { User, UserRole } from "../models/user.model.ts";
import { Field } from "../models/field.model.ts";
import { authenticateToken, authorizeRoles, type AuthRequest } from "../middleware/auth.middleware.ts";
import { FALLBACK_FIELDS } from "../db/seedFieldsData.ts";

const router = Router();

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
    urlFile: e.urlFile,
    currentStatus: e.currentStatus,
    date: e.date ? new Date(e.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    submittedBy: {
      userId: e.submittedBy?.userId || fallbackUser?.userId || "USR-002",
      fullName: e.submittedBy?.fullName || fallbackUser?.fullName || "Giáo viên",
      email: e.submittedBy?.email || fallbackUser?.email || "",
      departmentName: e.submittedBy?.departmentName || fallbackUser?.departmentName || "Tổng hợp",
    },
  };
};

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
            urlFile: e.urlFile,
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
router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Chưa xác thực!" });
    }

    const { title, description, standardName, criteriaName, originalFileName, fileFormat, fileSize, urlFile } = req.body;

    const dbUser = await User.findOne({
      $or: [
        { email: user.email.toLowerCase() },
        { userId: user.userId }
      ]
    });

    if (dbUser) {
      let field = await Field.findOne({ user: dbUser._id, fieldName: standardName });
      if (!field) {
        field = await Field.findOne({ user: dbUser._id });
      }

      let criterionId: any = new Types.ObjectId();
      if (field && field.criteria && field.criteria.length > 0) {
        const foundCrit = field.criteria.find((c: any) =>
          c.criteriaName === criteriaName || criteriaName?.includes(c.criteriaId) || criteriaName?.includes(c.criteriaName)
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
        originalFileName: originalFileName || "minh_chung.pdf",
        fileFormat: fileFormat || "application/pdf",
        fileSize: fileSize || 1024000,
        urlFile: urlFile || "#",
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
        urlFile: createdEv.urlFile,
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
        message: "Nộp minh chứng mới thành công vào MongoDB Atlas!",
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
      originalFileName: originalFileName || "tai_lieu_minh_chung.pdf",
      fileFormat: fileFormat || "application/pdf",
      fileSize: fileSize || 1024000,
      urlFile: urlFile || "https://example.com/files/doc.pdf",
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
      message: "Nộp minh chứng mới thành công qua Backend API!",
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

export default router;
