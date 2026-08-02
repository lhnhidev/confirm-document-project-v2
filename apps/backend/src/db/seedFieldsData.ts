import { Field } from "../models/field.model.ts";
import { User } from "../models/user.model.ts";
import { Types } from "mongoose";

export interface SeedCriterion {
  criteriaId: string;
  criteriaName: string;
  status?: string;
}

export interface SeedField {
  fieldCode: string;
  fieldName: string;
  percent: number;
  criteria: SeedCriterion[];
}

export const FALLBACK_FIELDS: SeedField[] = [
  {
    fieldCode: "I",
    fieldName: "NĂNG LỰC SỬ DỤNG CÔNG NGHỆ SỐ",
    percent: 0,
    criteria: [
      { criteriaId: "TC101", criteriaName: "Vận hành thiết bị số phục vụ công việc chuyên môn", status: "incomplete" },
      { criteriaId: "TC102", criteriaName: "Quản lý dữ liệu và tài nguyên số phục vụ giảng dạy", status: "incomplete" },
      { criteriaId: "TC103", criteriaName: "Thực hiện giao tiếp số trong công việc", status: "incomplete" },
      { criteriaId: "TC104", criteriaName: "Sử dụng nền tảng trực tuyến(zoom, google meet,Microsoft Teams..)", status: "incomplete" },
      { criteriaId: "TC105", criteriaName: "Tìm kiếm và khai thác thông tin số", status: "incomplete" }
    ]
  },
  {
    fieldCode: "II",
    fieldName: "THIẾT KẾ HỌC LIỆU SỐ",
    percent: 0,
    criteria: [
      { criteriaId: "TC201", criteriaName: "Thiết kế học liệu số", status: "incomplete" },
      { criteriaId: "TC202", criteriaName: "Thiết kế bài trình chiếu số", status: "incomplete" },
      { criteriaId: "TC203", criteriaName: "Thiết kế video bài giảng số", status: "incomplete" },
      { criteriaId: "TC204", criteriaName: "Thiết kế học liệu số tương tác", status: "incomplete" },
      { criteriaId: "TC205", criteriaName: "Quản lý học liệu số", status: "incomplete" }
    ]
  },
  {
    fieldCode: "III",
    fieldName: "TỔ CHỨC DẠY HỌC SỐ",
    percent: 0,
    criteria: [
      { criteriaId: "TC301", criteriaName: "Sử dụng nền tảng số trong tổ chức dạy học", status: "incomplete" },
      { criteriaId: "TC302", criteriaName: "Giao và thu nhận nhiệm vụ học tập trực tuyến", status: "incomplete" },
      { criteriaId: "TC303", criteriaName: "Quản lý lớp học trên môi trường số", status: "incomplete" },
      { criteriaId: "TC304", criteriaName: "Theo dõi và hỗ trợ tiến độ học tập", status: "incomplete" },
      { criteriaId: "TC305", criteriaName: "Tương tác và trao đổi với người học trên môi trường số", status: "incomplete" }
    ]
  },
  {
    fieldCode: "IV",
    fieldName: "KIỂM TRA, ĐÁNH GIÁ",
    percent: 0,
    criteria: [
      { criteriaId: "TC401", criteriaName: "Tổ chức kiểm tra, đánh giá trên môi trường số", status: "incomplete" },
      { criteriaId: "TC402", criteriaName: "Xây dựng và quản lý ngân hàng câu hỏi số", status: "incomplete" },
      { criteriaId: "TC403", criteriaName: "Phân tích kết quả đánh giá bằng công cụ số", status: "incomplete" },
      { criteriaId: "TC404", criteriaName: "Phản hồi kết quả học tập trên môi trường số", status: "incomplete" },
      { criteriaId: "TC405", criteriaName: "Quản lý và lưu trữ kết quả đánh giá số", status: "incomplete" }
    ]
  },
  {
    fieldCode: "V",
    fieldName: "ỨNG DỤNG AI",
    percent: 0,
    criteria: [
      { criteriaId: "TC501", criteriaName: "AI hỗ trợ soạn bài", status: "incomplete" },
      { criteriaId: "TC502", criteriaName: "AI tạo câu hỏi", status: "incomplete" },
      { criteriaId: "TC503", criteriaName: "AI tạo học liệu", status: "incomplete" },
      { criteriaId: "TC504", criteriaName: "Ứng dụng AI trong phân tích dữ liệu giáo dục", status: "incomplete" },
      { criteriaId: "TC505", criteriaName: "Sử dụng AI có trách nhiệm và đạo đức", status: "incomplete" }
    ]
  },
  {
    fieldCode: "VI",
    fieldName: "AN TOÀN, BẢO MẬT VÀ ĐẠO ĐỨC SỐ",
    percent: 0,
    criteria: [
      { criteriaId: "TC601", criteriaName: "Bảo vệ tài khoản", status: "incomplete" },
      { criteriaId: "TC602", criteriaName: "Bảo vệ dữ liệu", status: "incomplete" },
      { criteriaId: "TC603", criteriaName: "Bản quyền số", status: "incomplete" },
      { criteriaId: "TC604", criteriaName: "Ứng xử số", status: "incomplete" }
    ]
  },
  {
    fieldCode: "VII",
    fieldName: "CHIA SẺ, PHÁT TRIỂN CHUYÊN MÔN",
    percent: 0,
    criteria: [
      { criteriaId: "TC701", criteriaName: "Chia sẻ học liệu số và kinh nghiệm chuyên môn", status: "incomplete" },
      { criteriaId: "TC702", criteriaName: "Hỗ trợ đồng nghiệp", status: "incomplete" },
      { criteriaId: "TC703", criteriaName: "Tham gia tập huấn", status: "incomplete" },
      { criteriaId: "TC704", criteriaName: "Cộng đồng học tập", status: "incomplete" }
    ]
  },
  {
    fieldCode: "VIII",
    fieldName: "ĐỔI MỚI SÁNG TẠO",
    percent: 0,
    criteria: [
      { criteriaId: "TC801", criteriaName: "Sáng kiến/chuyển đổi số", status: "incomplete" },
      { criteriaId: "TC802", criteriaName: "Tham gia dự án số", status: "incomplete" }
    ]
  }
];

/**
 * Đảm bảo mỗi user trong database đều có 8 Tiêu chuẩn (Fields) theo cdm.pu
 */
export async function syncFieldsToDatabase() {
  try {
    try {
      await Field.collection.dropIndexes();
    } catch {
      // Ignore if no index
    }

    const users = await User.find();
    if (!users || users.length === 0) {
      console.log("ℹ️ Chưa có User trong MongoDB để gán 8 Fields.");
      return;
    }

    console.log(`🌱 Đang kiểm tra & đồng bộ 8 Fields cho ${users.length} người dùng trong Database...`);

    for (const user of users) {
      const existingFields = await Field.find({ user: user._id });

      if (existingFields.length !== 8) {
        // Làm sạch các field cũ bất hợp lệ nếu < 8 hoặc > 8
        await Field.deleteMany({ user: user._id });

        const createdFieldIds: Types.ObjectId[] = [];
        for (const template of FALLBACK_FIELDS) {
          const createdField = await Field.create({
            fieldCode: template.fieldCode,
            fieldName: template.fieldName,
            percent: template.percent,
            criteria: template.criteria as any,
            user: user._id as any
          });
          createdFieldIds.push(createdField._id as Types.ObjectId);
        }

        user.fields = createdFieldIds;
        await user.save();
        console.log(`  ✅ Đã tạo thành công 8 Fields cho cán bộ: ${user.fullName} (${user.email})`);
      } else {
        // Cập nhật lại mảng user.fields nếu chưa liên kết đủ ID
        const fieldIds = existingFields.map((f) => f._id as Types.ObjectId);
        if (!user.fields || user.fields.length !== 8) {
          user.fields = fieldIds;
          await user.save();
        }
      }

      // Đảm bảo các tiêu chí trong field của cán bộ Tống Thị Tuyết Huệ có status là "incomplete" và percent = 0
      if (user.fullName?.includes("Tống Thị Tuyết Huệ") || user.email === "ttthuedtnt@gmail.com") {
        for (const f of existingFields) {
          if (f.criteria && f.criteria.length > 0) {
            f.criteria.forEach((c: any) => {
              c.status = "incomplete";
            });
            f.percent = 0;
            await f.save();
          }
        }
        console.log(`  🔄 Đã reset tất cả tiêu chí về trạng thái chưa hoàn thành cho cán bộ: ${user.fullName}`);
      }
    }

    // Làm sạch các field tự do không thuộc user nào (từ phiên bản cũ)
    await Field.deleteMany({ $or: [{ user: { $exists: false } }, { user: null }] });

    console.log("🎉 Đã hoàn tất gán 8 Fields cho tất cả User trong MongoDB!");
  } catch (err) {
    console.warn("⚠️ Không thể đồng bộ Fields cho mỗi User trong MongoDB (chế độ offline):", err);
  }
}
