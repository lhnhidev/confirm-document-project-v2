import mongoose, { Types } from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { User, UserRole } from "../models/user.model.ts";
import { Field } from "../models/field.model.ts";
import { Evidence, EvidenceStatus } from "../models/evidence.model.ts";
import { FALLBACK_FIELDS } from "./seedFieldsData.ts";

dotenv.config();

// Chuỗi kết nối MongoDB
const MONGO_URI = process.env.MONGO_URI;

const sampleUsers = [
  {
    userId: "USR-001",
    fullName: "Lê Thị Ngọc Hơn",
    role: UserRole.DEPARTMENT_HEAD,
    email: "lethingochon.dtnt@gmail.com",
    phoneNumber: "0901234567",
    departmentName: "Tổng hợp",
    password: "123",
    major: "Tin học",
  },
  {
    userId: "USR-002",
    fullName: "Tống Thị Tuyết Huệ",
    role: UserRole.TEACHER,
    email: "ttthuedtnt@gmail.com",
    phoneNumber: "0908888888",
    departmentName: "Tổng hợp",
    password: "123",
    major: "An ninh quốc phòng",
  },
  {
    userId: "USR-003",
    fullName: "Nguyễn Chơn Nhất Hữu",
    role: UserRole.SCHOOL_BOARD,
    email: "ncnhuu83@gmail.com",
    phoneNumber: "0999999999",
    departmentName: "Tự nhiên",
    password: "123",
    major: "Vật lý",
  },
  {
    userId: "USR-004",
    fullName: "Phần Bùi Nhi",
    role: UserRole.TEACHER,
    email: "nhib2303837@student.ctu.edu.vn",
    phoneNumber: "0912345678",
    departmentName: "Tổng hợp",
    password: "123",
    major: "Sư phạm Tin học",
  },
];

async function seedData() {
  try {
    if (!MONGO_URI) {
      console.error("❌ not found MONGO_URI in file .env!");
      process.exit(1);
    }

    // 1. Kết nối MongoDB
    console.log("⏳ Đang kết nối tới MongoDB Atlas...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Kết nối MongoDB thành công!");

    // 2. Xóa dữ liệu cũ
    await User.deleteMany({});
    await Field.deleteMany({});
    await Evidence.deleteMany({});
    try {
      await Field.collection.dropIndexes();
    } catch {
      // Bỏ qua nếu chưa có index
    }
    console.log("🧹 Đã làm sạch dữ liệu bảng User, Field, Evidence và bỏ index cũ.");

    // 3. Tạo từng người dùng cùng 8 Fields tương ứng
    const saltRounds = 10;
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Tạo User
      const user = await User.create({
        userId: userData.userId,
        fullName: userData.fullName,
        role: userData.role,
        email: userData.email.toLowerCase(),
        phoneNumber: userData.phoneNumber,
        departmentName: userData.departmentName,
        major: userData.major,
        password: hashedPassword,
        fields: [],
        evidences: [],
      });

      // Tạo 8 Tiêu chuẩn (Fields) gán trực tiếp cho User này
      const createdFieldIds: Types.ObjectId[] = [];
      const createdFieldsMap: Record<string, any> = {};

      for (const template of FALLBACK_FIELDS) {
        const createdField = await Field.create({
          fieldCode: template.fieldCode,
          fieldName: template.fieldName,
          percent: 0,
          criteria: template.criteria as any,
          user: user._id as any,
        });
        createdFieldIds.push(createdField._id as Types.ObjectId);
        createdFieldsMap[template.fieldCode] = createdField;
      }

      // Cập nhật mảng fields trong User
      user.fields = createdFieldIds;
      await user.save();

      // Nếu là Giáo viên (USR-002 hoặc USR-004), tạo thêm danh sách minh chứng mẫu trực tiếp trong Atlas DB
      if (user.role === UserRole.TEACHER) {
        const userEvidencesList = [
          {
            evidenceId: `MC-2026-${user.userId}-001`,
            title: "Vận hành hệ thống quản lý học tập LMS cho học sinh",
            description: "Đã ứng dụng thành thạo thiết bị số và phần mềm học tập trong năm học.",
            fieldCode: "I",
            critId: "TC101",
            status: EvidenceStatus.APPROVED,
            originalFileName: "VanHanhThietBiSo_2025.pdf",
          },
          {
            evidenceId: `MC-2026-${user.userId}-002`,
            title: "Số hóa kho dữ liệu bài giảng và đề thi môn học",
            description: "Quản lý và lưu trữ dữ liệu giảng dạy trên môi trường Google Drive.",
            fieldCode: "I",
            critId: "TC102",
            status: EvidenceStatus.APPROVED,
            originalFileName: "QuanLyDuLieuSo_2025.pdf",
          },
          {
            evidenceId: `MC-2026-${user.userId}-003`,
            title: "Bài giảng điện tử tương tác e-Learning",
            description: "Thiết kế bài giảng tương tác Canva & iSpring.",
            fieldCode: "II",
            critId: "TC201",
            status: EvidenceStatus.PENDING,
            originalFileName: "HocLieuSo_Canva.pdf",
          },
          {
            evidenceId: `MC-2026-${user.userId}-004`,
            title: "Ứng dụng ChatGPT hỗ trợ xây dựng ma trận câu hỏi",
            description: "Sử dụng công cụ AI sinh câu hỏi trắc nghiệm khách quan.",
            fieldCode: "V",
            critId: "TC502",
            status: EvidenceStatus.NEEDS_SUPPLEMENT,
            originalFileName: "AITaoCauHoi_2026.pdf",
          },
        ];

        const userEvIds: Types.ObjectId[] = [];
        for (const item of userEvidencesList) {
          const fieldObj = createdFieldsMap[item.fieldCode];
          let criterionId = fieldObj?.criteria?.[0]?._id;
          if (fieldObj && fieldObj.criteria) {
            const foundCrit = fieldObj.criteria.find((c: any) => c.criteriaId === item.critId);
            if (foundCrit) {
              criterionId = foundCrit._id;
              // Cập nhật status của criterion trong Field
              if (item.status === EvidenceStatus.APPROVED) {
                foundCrit.status = "approved";
              } else if (item.status === EvidenceStatus.PENDING) {
                foundCrit.status = "pending";
              } else if (item.status === EvidenceStatus.NEEDS_SUPPLEMENT) {
                foundCrit.status = "rejected";
              }
            }
          }

          if (fieldObj) {
            await fieldObj.save(); // Tính lại percent của field
          }

          const createdEv = await Evidence.create({
            evidenceId: item.evidenceId,
            title: item.title,
            description: item.description,
            date: new Date(),
            originalFileName: item.originalFileName,
            fileFormat: "application/pdf",
            fileSize: 2450000,
            urlFile: "https://example.com/files/doc.pdf",
            currentStatus: item.status,
            submittedBy: user._id,
            fieldId: fieldObj._id,
            criterionId: criterionId,
          });

          userEvIds.push(createdEv._id as Types.ObjectId);
        }

        user.evidences = userEvIds;
        await user.save();
      }

      console.log(`  ✅ Đã tạo User: ${user.fullName} (${user.role}) - Gán ${createdFieldIds.length} Fields và các minh chứng mẫu!`);
    }

    console.log("🎉 Đã tạo thành công tất cả người dùng, 8 Fields và dữ liệu Minh chứng trong Atlas DB!");
  } catch (error) {
    console.error("❌ Lỗi khi chạy seed script:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Đã ngắt kết nối MongoDB.");
    process.exit(0);
  }
}

seedData();


