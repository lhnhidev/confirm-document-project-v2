import bcrypt from "bcryptjs";
import { User, UserRole } from "../models/user.model.ts";

export interface SeedUser {
  userId: string;
  fullName: string;
  role: UserRole;
  email: string;
  phoneNumber?: string;
  departmentName?: string;
  major: string;
  passwordHash: string;
  rawPassword?: string;
}

// Fixed pre-generated hash for "123" to make startup instant
const HASH_123 = "$2a$10$fV3.vO94wzS5o/P7Y1iIouE1LgCgS9gIq.jQ4f7c1WjJb0Z2qIInS";

export const FALLBACK_USERS: SeedUser[] = [
  {
    userId: "USR-001",
    fullName: "Lê Thị Ngọc Hơn",
    role: UserRole.DEPARTMENT_HEAD,
    email: "lethingochon.dtnt@gmail.com",
    phoneNumber: "0901234567",
    departmentName: "Tổng hợp",
    major: "Tin học",
    passwordHash: HASH_123,
    rawPassword: "123"
  },
  {
    userId: "USR-002",
    fullName: "Tống Thị Tuyết Huệ",
    role: UserRole.TEACHER,
    email: "ttthuedtnt@gmail.com",
    phoneNumber: "0908888888",
    departmentName: "Tổng hợp",
    major: "An ninh quốc phòng",
    passwordHash: HASH_123,
    rawPassword: "123"
  },
  {
    userId: "USR-003",
    fullName: "Nguyễn Chơn Nhất Hữu",
    role: UserRole.SCHOOL_BOARD,
    email: "ncnhuu83@gmail.com",
    phoneNumber: "0999999999",
    departmentName: "Tự nhiên",
    major: "Vật lý",
    passwordHash: HASH_123,
    rawPassword: "123"
  },
  {
    userId: "USR-004",
    fullName: "Phần Bùi Nhi",
    role: UserRole.TEACHER,
    email: "nhib2303837@student.ctu.edu.vn",
    phoneNumber: "0912345678",
    departmentName: "Tổng hợp",
    major: "Sư phạm Tin học",
    passwordHash: HASH_123,
    rawPassword: "123"
  }
];

export async function syncSeedUsersToDatabase() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("🌱 Database MongoDB rỗng. Đang tự động seed người dùng mẫu...");
      for (const u of FALLBACK_USERS) {
        await User.create({
          userId: u.userId,
          fullName: u.fullName,
          role: u.role,
          email: u.email,
          phoneNumber: u.phoneNumber,
          departmentName: u.departmentName,
          major: u.major,
          password: u.passwordHash,
          rawPassword: u.rawPassword
        });
      }
      console.log("✅ Đã tự động khởi tạo người dùng mẫu trong MongoDB!");
    }
  } catch (err) {
    console.warn("⚠️ Không thể đồng bộ seed users vào MongoDB (chế độ offline):", err);
  }
}
