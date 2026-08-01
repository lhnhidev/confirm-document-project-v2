import type { User } from "../types/auth"
import { UserRole } from "../types/auth"

export interface SeedUserWithPassword extends User {
  password: string
}

export const SEED_USERS: SeedUserWithPassword[] = [
  {
    userId: "USR-002",
    fullName: "Tống Thị Tuyết Huệ",
    role: UserRole.TEACHER,
    email: "ttthuedtnt@gmail.com",
    phoneNumber: "0908888888",
    departmentName: "Tổng hợp",
    major: "An ninh quốc phòng",
    password: "123"
  },
  {
    userId: "USR-001",
    fullName: "Lê Thị Ngọc Hơn",
    role: UserRole.DEPARTMENT_HEAD,
    email: "lethingochon.dtnt@gmail.com",
    phoneNumber: "0901234567",
    departmentName: "Tổng hợp",
    major: "Tin học",
    password: "123"
  },
  {
    userId: "USR-003",
    fullName: "Nguyễn Chơn Nhất Hữu",
    role: UserRole.SCHOOL_BOARD,
    email: "ncnhuu83@gmail.com",
    phoneNumber: "0999999999",
    departmentName: "Tự nhiên",
    major: "Vật lý",
    password: "123"
  }
]
