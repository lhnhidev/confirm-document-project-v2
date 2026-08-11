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
    role: UserRole.TEACHER,
    email: "lethingochon.dtnt@gmail.com",
    phoneNumber: "0901000001",
    departmentName: "Tổ Tổng Hợp",
    password: "123",
    major: "Tin học"
  },
  {
    userId: "USR-002",
    fullName: "Lê Phú Quốc",
    role: UserRole.DEPARTMENT_HEAD,
    email: "phuoc.ipebl@gmail.com",
    phoneNumber: "0901000002",
    departmentName: "Tổ Tổng Hợp",
    password: "123",
    major: "Công nghệ"
  },
  {
    userId: "USR-003",
    fullName: "Tống Thị Tuyết Huệ",
    role: UserRole.TEACHER,
    email: "ttthuedtnt@gmail.com",
    phoneNumber: "0901000003",
    departmentName: "Tổ Tổng Hợp",
    password: "123",
    major: "QPAN"
  },
  {
    userId: "USR-004",
    fullName: "Danh Sung",
    role: UserRole.DEPARTMENT_VICE_HEAD,
    email: "danhsung1991@gmail.com",
    phoneNumber: "0901000004",
    departmentName: "Tổ Tổng Hợp",
    password: "123",
    major: "Thể dục"
  },
  {
    userId: "USR-005",
    fullName: "Tăng Chuyên",
    role: UserRole.TEACHER,
    email: "tangchuyen2214@gmail.com",
    phoneNumber: "0901000005",
    departmentName: "Tổ Tổng Hợp",
    password: "123",
    major: "Thể dục"
  },
  {
    userId: "USR-006",
    fullName: "Nguyễn Minh Thiêm",
    role: UserRole.TEACHER,
    email: "minhthiem.cdn@gmail.com",
    phoneNumber: "0901000006",
    departmentName: "Tổ Tổng Hợp",
    password: "123",
    major: "Tin học"
  },
  {
    userId: "USR-007",
    fullName: "Nguyễn Thị Yến",
    role: UserRole.DEPARTMENT_VICE_HEAD,
    email: "thiyennguyen1981@gmail.com",
    phoneNumber: "0901000007",
    departmentName: "Tổ Tự Nhiên",
    password: "123",
    major: "Toán"
  },
  {
    userId: "USR-008",
    fullName: "Thạch Thị Khemarinh",
    role: UserRole.TEACHER,
    email: "rinh1983@gmail.com",
    phoneNumber: "0901000008",
    departmentName: "Tổ Tự Nhiên",
    password: "123",
    major: "Toán"
  },
  {
    userId: "USR-009",
    fullName: "Trịnh Thành Thảo",
    role: UserRole.TEACHER,
    email: "thanhtrinh2103@gmail.com",
    phoneNumber: "0901000009",
    departmentName: "Tổ Tự Nhiên",
    password: "123",
    major: "Toán"
  },
  {
    userId: "USR-010",
    fullName: "Tăng Ra Thi",
    role: UserRole.TEACHER,
    email: "tangrathi1977@gmail.com",
    phoneNumber: "0901000010",
    departmentName: "Tổ Tự Nhiên",
    password: "123",
    major: "Toán"
  },
  {
    userId: "USR-011",
    fullName: "Hứa Thị Kiều Ni",
    role: UserRole.TEACHER,
    email: "htkni.tt@gmail.com",
    phoneNumber: "0901000011",
    departmentName: "Tổ Tự Nhiên",
    password: "123",
    major: "Toán"
  },
  {
    userId: "USR-012",
    fullName: "Châu Vương Anh Hùng",
    role: UserRole.DEPARTMENT_HEAD,
    email: "chauvuonganhhung@gmail.com",
    phoneNumber: "0901000012",
    departmentName: "Tổ Ngoại Ngữ",
    password: "123",
    major: "Tiếng Anh"
  },
  {
    userId: "USR-013",
    fullName: "Lâm Thanh Nhã",
    role: UserRole.DEPARTMENT_VICE_HEAD,
    email: "nhathanlamda10vdt@gmail.com",
    phoneNumber: "0901000013",
    departmentName: "Tổ Ngoại Ngữ",
    password: "123",
    major: "Tiếng Khmer"
  },
  {
    userId: "USR-014",
    fullName: "Trần Văn Hưng",
    role: UserRole.TEACHER,
    email: "tranvanhungbl72@gmail.com",
    phoneNumber: "0901000014",
    departmentName: "Tổ Ngoại Ngữ",
    password: "123",
    major: "Tiếng Anh"
  },
  {
    userId: "USR-015",
    fullName: "Phạm Thị Ngọc Hạnh",
    role: UserRole.TEACHER,
    email: "ptngochanh1978@gmail.com",
    phoneNumber: "0901000015",
    departmentName: "Tổ Ngoại Ngữ",
    password: "123",
    major: "Tiếng Anh"
  },
  {
    userId: "USR-016",
    fullName: "Danh Thị Bé Ngoan",
    role: UserRole.TEACHER,
    email: "utngoanchelsea@gmail.com",
    phoneNumber: "0901000016",
    departmentName: "Tổ Ngoại Ngữ",
    password: "123",
    major: "Tiếng Khmer"
  },
  {
    userId: "USR-017",
    fullName: "Mai Hữu Lộc",
    role: UserRole.TEACHER,
    email: "maihuuloc150593@gmail.com",
    phoneNumber: "0901000017",
    departmentName: "Tổ Ngoại Ngữ",
    password: "123",
    major: "Tiếng Khmer"
  },
  {
    userId: "USR-018",
    fullName: "Hồ Thị Lệ Uyên",
    role: UserRole.TEACHER,
    email: "hothileyuyen1905@gmail.com",
    phoneNumber: "0901000018",
    departmentName: "Tổ Ngoại Ngữ",
    password: "123",
    major: "Tiếng Anh"
  },
  {
    userId: "USR-019",
    fullName: "Lâm Tú Huỳnh",
    role: UserRole.TEACHER,
    email: "lamtuhuynh040602@gmail.com",
    phoneNumber: "0901000019",
    departmentName: "Tổ Xã Hội",
    password: "123",
    major: "Địa lý"
  },
  {
    userId: "USR-020",
    fullName: "Nguyễn Thị Xuyên",
    role: UserRole.TEACHER,
    email: "ntxuyen515@gmail.com",
    phoneNumber: "0901000020",
    departmentName: "Tổ Xã Hội",
    password: "123",
    major: "Lịch sử"
  },
  {
    userId: "USR-021",
    fullName: "Danh Sang",
    role: UserRole.DEPARTMENT_VICE_HEAD,
    email: "sang050480@gmail.com",
    phoneNumber: "0901000021",
    departmentName: "Tổ Xã Hội",
    password: "123",
    major: "Lịch sử"
  },
  {
    userId: "USR-022",
    fullName: "Cao Thị Túy Hường",
    role: UserRole.TEACHER,
    email: "caotuyhuong@gmail.com",
    phoneNumber: "0901000022",
    departmentName: "Tổ Xã Hội",
    password: "123",
    major: "Địa lý"
  },
  {
    userId: "USR-023",
    fullName: "Trương Bảo Xuyên",
    role: UserRole.TEACHER,
    email: "truongxuyen82@gmail.com",
    phoneNumber: "0901000023",
    departmentName: "Tổ Xã Hội",
    password: "123",
    major: "KTPL"
  },
  {
    userId: "USR-024",
    fullName: "Vũ Bích Kim",
    role: UserRole.DEPARTMENT_HEAD,
    email: "vubichkim@gmail.com",
    phoneNumber: "0901000024",
    departmentName: "Tổ Xã Hội",
    password: "123",
    major: "Ngữ văn"
  },
  {
    userId: "USR-025",
    fullName: "Lê Thị Lanh",
    role: UserRole.TEACHER,
    email: "lethilanh1987bl@gmail.com",
    phoneNumber: "0901000025",
    departmentName: "Tổ Xã Hội",
    password: "123",
    major: "Ngữ văn"
  },
  {
    userId: "USR-026",
    fullName: "Nguyễn Hoàng Kiên",
    role: UserRole.TEACHER,
    email: "nguyenhoangkienhb@gmail.com",
    phoneNumber: "0901000026",
    departmentName: "Tổ Xã Hội",
    password: "123",
    major: "Ngữ văn"
  },
  {
    userId: "USR-027",
    fullName: "Hoàng Thị Kim Chi",
    role: UserRole.TEACHER,
    email: "hoangchi171@gmail.com",
    phoneNumber: "0901000027",
    departmentName: "Tổ Xã Hội",
    password: "123",
    major: "Ngữ văn"
  },
  {
    userId: "USR-028",
    fullName: "Quách Tấn Vinh",
    role: UserRole.TEACHER,
    email: "qvinhthcstp.dh@sobaclieu.edu.vn",
    phoneNumber: "0901000028",
    departmentName: "Tổ Xã Hội",
    password: "123",
    major: "Ngữ văn"
  },
  {
    userId: "USR-029",
    fullName: "Lý Thanh Cần",
    role: UserRole.TEACHER,
    email: "lythanhcandtnt@gmail.com",
    phoneNumber: "0901000029",
    departmentName: "Tổ Tự Nhiên",
    password: "123",
    major: "Vật lý"
  },
  {
    userId: "USR-030",
    fullName: "Trần Trung Trận",
    role: UserRole.TEACHER,
    email: "ttran771@gmail.com",
    phoneNumber: "0901000030",
    departmentName: "Tổ Tự Nhiên",
    password: "123",
    major: "Vật lý"
  },
  {
    userId: "USR-031",
    fullName: "Bùi Phi Thoàng",
    role: UserRole.TEACHER,
    email: "phithoangbui@gmail.com",
    phoneNumber: "0901000031",
    departmentName: "Tổ Tự Nhiên",
    password: "123",
    major: "Vật lý"
  },
  {
    userId: "USR-032",
    fullName: "Trần Như Thủy",
    role: UserRole.DEPARTMENT_HEAD,
    email: "nguyetthuy1979@gmail.com",
    phoneNumber: "0901000032",
    departmentName: "Tổ Tự Nhiên",
    password: "123",
    major: "Hóa học"
  },
  {
    userId: "USR-033",
    fullName: "Ngô Thị Lý",
    role: UserRole.TEACHER,
    email: "baply82@gmail.com",
    phoneNumber: "0901000033",
    departmentName: "Tổ Tự Nhiên",
    password: "123",
    major: "Hóa học"
  },
  {
    userId: "USR-034",
    fullName: "Thạch Thị Thúy Hằng",
    role: UserRole.TEACHER,
    email: "thachthithuyhang011099@gmail.com",
    phoneNumber: "0901000034",
    departmentName: "Tổ Tự Nhiên",
    password: "123",
    major: "Sinh học"
  },
  {
    userId: "USR-035",
    fullName: "Lâm Văn Hùng",
    role: UserRole.VICE_PRINCIPAL,
    email: "lamvanhung.dtnt1969@gmail.com",
    phoneNumber: "0901000035",
    departmentName: "Tổ Tự Nhiên",
    password: "123",
    major: "Vật lý"
  },
  {
    userId: "USR-036",
    fullName: "Nguyễn Chơn Nhất Hữu",
    role: UserRole.VICE_PRINCIPAL,
    email: "ncnhuu83@gmail.com",
    phoneNumber: "0901000036",
    departmentName: "Tổ Tự Nhiên",
    password: "123",
    major: "Vật lý"
  },
  {
    userId: "USR-037",
    fullName: "Dư Quốc Kiệt",
    role: UserRole.PRINCIPAL,
    email: "duquockiet@gmail.com",
    phoneNumber: "0901000037",
    departmentName: "Tổ Xã Hội",
    password: "123",
    major: "Địa lý"
  },
  {
    userId: "USR-038",
    fullName: "Phần Bùi Nhi",
    role: UserRole.TEACHER,
    email: "nhib2303837@student.ctu.edu.vn",
    phoneNumber: "0912345678",
    departmentName: "Tổ Tổng Hợp",
    password: "123",
    major: "Sư phạm Tin học"
  }
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


