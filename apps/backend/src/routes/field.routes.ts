import { Router, type Response } from "express";
import { Field } from "../models/field.model.ts";
import { User } from "../models/user.model.ts";
import { FALLBACK_FIELDS } from "../db/seedFieldsData.ts";
import { authenticateToken, type AuthRequest } from "../middleware/auth.middleware.ts";
import { Types } from "mongoose";

const router = Router();

const FIELD_ORDER = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

function sortFields(fields: any[]) {
  return fields.sort((a, b) => {
    const idxA = FIELD_ORDER.indexOf(a.fieldCode);
    const idxB = FIELD_ORDER.indexOf(b.fieldCode);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    return a.fieldCode.localeCompare(b.fieldCode);
  });
}

/**
 * Express Handler lấy danh sách Fields của User đang đăng nhập từ CSDL MongoDB Atlas
 */
async function getUserFieldsHandler(req: AuthRequest, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Chưa xác thực người dùng!" });
    }

    let dbUser = await User.findOne({
      $or: [
        { email: user.email.toLowerCase() },
        { userId: user.userId }
      ]
    });

    let fields: any[] = [];

    if (dbUser) {
      fields = await Field.find({ user: dbUser._id });

      // Nếu user chưa đủ 8 fields, tự động tạo mới 8 fields gán cho dbUser._id
      if (fields.length !== 8) {
        await Field.deleteMany({ user: dbUser._id });
        const createdIds: Types.ObjectId[] = [];
        fields = [];

        for (const template of FALLBACK_FIELDS) {
          const newField = await Field.create({
            fieldCode: template.fieldCode,
            fieldName: template.fieldName,
            percent: template.percent,
            criteria: template.criteria,
            user: dbUser._id
          });
          createdIds.push(newField._id as Types.ObjectId);
          fields.push(newField);
        }

        dbUser.fields = createdIds;
        await dbUser.save();
      }
    } else {
      dbUser = await User.create({
        userId: user.userId,
        fullName: user.fullName,
        email: user.email.toLowerCase(),
        role: user.role,
        departmentName: user.departmentName || "Tổng hợp",
        major: user.major || "",
        phoneNumber: user.phoneNumber || ""
      });

      const createdIds: Types.ObjectId[] = [];
      for (const template of FALLBACK_FIELDS) {
        const newField = await Field.create({
          fieldCode: template.fieldCode,
          fieldName: template.fieldName,
          percent: template.percent,
          criteria: template.criteria,
          user: dbUser._id
        });
        createdIds.push(newField._id as Types.ObjectId);
        fields.push(newField);
      }
      dbUser.fields = createdIds;
      await dbUser.save();
    }

    // Fallback nếu trong DB hoàn toàn chưa có user
    if (!fields || fields.length === 0) {
      fields = FALLBACK_FIELDS as any;
    }

    fields = sortFields(fields);

    const totalCriteria = fields.reduce((sum, f) => sum + (f.criteria ? f.criteria.length : 0), 0);

    return res.status(200).json({
      success: true,
      userId: user.userId,
      userMongoId: dbUser ? dbUser._id : null,
      totalFields: fields.length,
      totalCriteria,
      fields
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi lấy danh sách Tiêu chuẩn & Tiêu chí cá nhân!",
      error: error.message
    });
  }
}

/**
 * GET /api/fields/my-fields
 * Lấy danh sách Fields sở hữu bởi user hiện tại theo user Mongo ID
 */
router.get("/my-fields", authenticateToken, getUserFieldsHandler);

/**
 * GET /api/fields
 * Lấy danh sách 8 Tiêu chuẩn (Fields) và các Tiêu chí (Criteria) của Cán bộ đang đăng nhập
 */
router.get("/", authenticateToken, getUserFieldsHandler);

export default router;

