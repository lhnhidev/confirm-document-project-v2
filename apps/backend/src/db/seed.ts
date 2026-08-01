import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { User, UserRole } from "../models/user.model.ts"; // Sửa đường dẫn tới file model của bạn

dotenv.config();

// Chuỗi kết nối MongoDB (Thay bằng URI của bạn hoặc dùng file .env)
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
];

async function seedData() {
  try {
    if (!MONGO_URI) {
      console.error("❌ not found MONGO_URI in file .env!");
      process.exit(1);
    }

    // 1. Kết nối MongoDB
    console.log("⏳ Đang kết nối tới MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Kết nối MongoDB thành công!");

    // 2. Xóa dữ liệu cũ (Tùy chọn: bỏ dòng này nếu muốn giữ dữ liệu cũ)
    await User.deleteMany({});
    console.log("🧹 Đã làm sạch dữ liệu bảng User cũ.");

    // 3. Hash mật khẩu và chuẩn bị dữ liệu
    const saltRounds = 10;
    const preparedUsers = await Promise.all(
      sampleUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, saltRounds),
      })),
    );

    // 4. Thêm vào database
    await User.insertMany(preparedUsers);
    console.log(`🎉 Đã tạo thành công ${preparedUsers.length} người dùng mẫu!`);
  } catch (error) {
    console.error("❌ Lỗi khi chạy seed script:", error);
  } finally {
    // 5. Đóng kết nối DB
    await mongoose.disconnect();
    console.log("🔌 Đã ngắt kết nối MongoDB.");
    process.exit(0);
  }
}

seedData();
