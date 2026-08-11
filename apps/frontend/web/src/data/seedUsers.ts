import type { User } from "../types/auth"
import { UserRole } from "../types/auth"

export interface SeedUserWithPassword extends User {
  password: string
}

export const SEED_USERS: SeedUserWithPassword[] = [
  {
    userId: "USR-001",
    fullName: "Lê Thị Ngọc Hơn",
    role: UserRole.TEACHER,
    email: "lethingochon.dtnt@gmail.com",
    phoneNumber: "0901000001",
    departmentName: "Tổ Tổng Hợp",
    major: "Tin học",
    password: "123"
  },
  {
    userId: "USR-002",
    fullName: "Lê Phú Quốc",
    role: UserRole.DEPARTMENT_HEAD,
    email: "phuoc.ipebl@gmail.com",
    phoneNumber: "0901000002",
    departmentName: "Tổ Tổng Hợp",
    major: "Công nghệ",
    password: "123"
  },
  {
    userId: "USR-003",
    fullName: "Tống Thị Tuyết Huệ",
    role: UserRole.TEACHER,
    email: "ttthuedtnt@gmail.com",
    phoneNumber: "0901000003",
    departmentName: "Tổ Tổng Hợp",
    major: "QPAN",
    password: "123"
  },
  {
    userId: "USR-004",
    fullName: "Danh Sung",
    role: UserRole.DEPARTMENT_VICE_HEAD,
    email: "danhsung1991@gmail.com",
    phoneNumber: "0901000004",
    departmentName: "Tổ Tổng Hợp",
    major: "Thể dục",
    password: "123"
  },
  {
    userId: "USR-005",
    fullName: "Tăng Chuyên",
    role: UserRole.TEACHER,
    email: "tangchuyen2214@gmail.com",
    phoneNumber: "0901000005",
    departmentName: "Tổ Tổng Hợp",
    major: "Thể dục",
    password: "123"
  },
  {
    userId: "USR-006",
    fullName: "Nguyễn Minh Thiêm",
    role: UserRole.TEACHER,
    email: "minhthiem.cdn@gmail.com",
    phoneNumber: "0901000006",
    departmentName: "Tổ Tổng Hợp",
    major: "Tin học",
    password: "123"
  },
  {
    userId: "USR-007",
    fullName: "Nguyễn Thị Yến",
    role: UserRole.DEPARTMENT_VICE_HEAD,
    email: "thiyennguyen1981@gmail.com",
    phoneNumber: "0901000007",
    departmentName: "Tổ Tự Nhiên",
    major: "Toán",
    password: "123"
  },
  {
    userId: "USR-008",
    fullName: "Thạch Thị Khemarinh",
    role: UserRole.TEACHER,
    email: "rinh1983@gmail.com",
    phoneNumber: "0901000008",
    departmentName: "Tổ Tự Nhiên",
    major: "Toán",
    password: "123"
  },
  {
    userId: "USR-009",
    fullName: "Trịnh Thành Thảo",
    role: UserRole.TEACHER,
    email: "thanhtrinh2103@gmail.com",
    phoneNumber: "0901000009",
    departmentName: "Tổ Tự Nhiên",
    major: "Toán",
    password: "123"
  },
  {
    userId: "USR-010",
    fullName: "Tăng Ra Thi",
    role: UserRole.TEACHER,
    email: "tangrathi1977@gmail.com",
    phoneNumber: "0901000010",
    departmentName: "Tổ Tự Nhiên",
    major: "Toán",
    password: "123"
  },
  {
    userId: "USR-011",
    fullName: "Hứa Thị Kiều Ni",
    role: UserRole.TEACHER,
    email: "htkni.tt@gmail.com",
    phoneNumber: "0901000011",
    departmentName: "Tổ Tự Nhiên",
    major: "Toán",
    password: "123"
  },
  {
    userId: "USR-012",
    fullName: "Châu Vương Anh Hùng",
    role: UserRole.DEPARTMENT_HEAD,
    email: "chauvuonganhhung@gmail.com",
    phoneNumber: "0901000012",
    departmentName: "Tổ Ngoại Ngữ",
    major: "Tiếng Anh",
    password: "123"
  },
  {
    userId: "USR-013",
    fullName: "Lâm Thanh Nhã",
    role: UserRole.DEPARTMENT_VICE_HEAD,
    email: "nhathanlamda10vdt@gmail.com",
    phoneNumber: "0901000013",
    departmentName: "Tổ Ngoại Ngữ",
    major: "Tiếng Khmer",
    password: "123"
  },
  {
    userId: "USR-014",
    fullName: "Trần Văn Hưng",
    role: UserRole.TEACHER,
    email: "tranvanhungbl72@gmail.com",
    phoneNumber: "0901000014",
    departmentName: "Tổ Ngoại Ngữ",
    major: "Tiếng Anh",
    password: "123"
  },
  {
    userId: "USR-015",
    fullName: "Phạm Thị Ngọc Hạnh",
    role: UserRole.TEACHER,
    email: "ptngochanh1978@gmail.com",
    phoneNumber: "0901000015",
    departmentName: "Tổ Ngoại Ngữ",
    major: "Tiếng Anh",
    password: "123"
  },
  {
    userId: "USR-016",
    fullName: "Danh Thị Bé Ngoan",
    role: UserRole.TEACHER,
    email: "utngoanchelsea@gmail.com",
    phoneNumber: "0901000016",
    departmentName: "Tổ Ngoại Ngữ",
    major: "Tiếng Khmer",
    password: "123"
  },
  {
    userId: "USR-017",
    fullName: "Mai Hữu Lộc",
    role: UserRole.TEACHER,
    email: "maihuuloc150593@gmail.com",
    phoneNumber: "0901000017",
    departmentName: "Tổ Ngoại Ngữ",
    major: "Tiếng Khmer",
    password: "123"
  },
  {
    userId: "USR-018",
    fullName: "Hồ Thị Lệ Uyên",
    role: UserRole.TEACHER,
    email: "hothileyuyen1905@gmail.com",
    phoneNumber: "0901000018",
    departmentName: "Tổ Ngoại Ngữ",
    major: "Tiếng Anh",
    password: "123"
  },
  {
    userId: "USR-019",
    fullName: "Lâm Tú Huỳnh",
    role: UserRole.TEACHER,
    email: "lamtuhuynh040602@gmail.com",
    phoneNumber: "0901000019",
    departmentName: "Tổ Xã Hội",
    major: "Địa lý",
    password: "123"
  },
  {
    userId: "USR-020",
    fullName: "Nguyễn Thị Xuyên",
    role: UserRole.TEACHER,
    email: "ntxuyen515@gmail.com",
    phoneNumber: "0901000020",
    departmentName: "Tổ Xã Hội",
    major: "Lịch sử",
    password: "123"
  },
  {
    userId: "USR-021",
    fullName: "Danh Sang",
    role: UserRole.DEPARTMENT_VICE_HEAD,
    email: "sang050480@gmail.com",
    phoneNumber: "0901000021",
    departmentName: "Tổ Xã Hội",
    major: "Lịch sử",
    password: "123"
  },
  {
    userId: "USR-022",
    fullName: "Cao Thị Túy Hường",
    role: UserRole.TEACHER,
    email: "caotuyhuong@gmail.com",
    phoneNumber: "0901000022",
    departmentName: "Tổ Xã Hội",
    major: "Địa lý",
    password: "123"
  },
  {
    userId: "USR-023",
    fullName: "Trương Bảo Xuyên",
    role: UserRole.TEACHER,
    email: "truongxuyen82@gmail.com",
    phoneNumber: "0901000023",
    departmentName: "Tổ Xã Hội",
    major: "KTPL",
    password: "123"
  },
  {
    userId: "USR-024",
    fullName: "Vũ Bích Kim",
    role: UserRole.DEPARTMENT_HEAD,
    email: "vubichkim@gmail.com",
    phoneNumber: "0901000024",
    departmentName: "Tổ Xã Hội",
    major: "Ngữ văn",
    password: "123"
  },
  {
    userId: "USR-025",
    fullName: "Lê Thị Lanh",
    role: UserRole.TEACHER,
    email: "lethilanh1987bl@gmail.com",
    phoneNumber: "0901000025",
    departmentName: "Tổ Xã Hội",
    major: "Ngữ văn",
    password: "123"
  },
  {
    userId: "USR-026",
    fullName: "Nguyễn Hoàng Kiên",
    role: UserRole.TEACHER,
    email: "nguyenhoangkienhb@gmail.com",
    phoneNumber: "0901000026",
    departmentName: "Tổ Xã Hội",
    major: "Ngữ văn",
    password: "123"
  },
  {
    userId: "USR-027",
    fullName: "Hoàng Thị Kim Chi",
    role: UserRole.TEACHER,
    email: "hoangchi171@gmail.com",
    phoneNumber: "0901000027",
    departmentName: "Tổ Xã Hội",
    major: "Ngữ văn",
    password: "123"
  },
  {
    userId: "USR-028",
    fullName: "Quách Tấn Vinh",
    role: UserRole.TEACHER,
    email: "qvinhthcstp.dh@sobaclieu.edu.vn",
    phoneNumber: "0901000028",
    departmentName: "Tổ Xã Hội",
    major: "Ngữ văn",
    password: "123"
  },
  {
    userId: "USR-029",
    fullName: "Lý Thanh Cần",
    role: UserRole.TEACHER,
    email: "lythanhcandtnt@gmail.com",
    phoneNumber: "0901000029",
    departmentName: "Tổ Tự Nhiên",
    major: "Vật lý",
    password: "123"
  },
  {
    userId: "USR-030",
    fullName: "Trần Trung Trận",
    role: UserRole.TEACHER,
    email: "ttran771@gmail.com",
    phoneNumber: "0901000030",
    departmentName: "Tổ Tự Nhiên",
    major: "Vật lý",
    password: "123"
  },
  {
    userId: "USR-031",
    fullName: "Bùi Phi Thoàng",
    role: UserRole.TEACHER,
    email: "phithoangbui@gmail.com",
    phoneNumber: "0901000031",
    departmentName: "Tổ Tự Nhiên",
    major: "Vật lý",
    password: "123"
  },
  {
    userId: "USR-032",
    fullName: "Trần Như Thủy",
    role: UserRole.DEPARTMENT_HEAD,
    email: "nguyetthuy1979@gmail.com",
    phoneNumber: "0901000032",
    departmentName: "Tổ Tự Nhiên",
    major: "Hóa học",
    password: "123"
  },
  {
    userId: "USR-033",
    fullName: "Ngô Thị Lý",
    role: UserRole.TEACHER,
    email: "baply82@gmail.com",
    phoneNumber: "0901000033",
    departmentName: "Tổ Tự Nhiên",
    major: "Hóa học",
    password: "123"
  },
  {
    userId: "USR-034",
    fullName: "Thạch Thị Thúy Hằng",
    role: UserRole.TEACHER,
    email: "thachthithuyhang011099@gmail.com",
    phoneNumber: "0901000034",
    departmentName: "Tổ Tự Nhiên",
    major: "Sinh học",
    password: "123"
  },
  {
    userId: "USR-035",
    fullName: "Lâm Văn Hùng",
    role: UserRole.VICE_PRINCIPAL,
    email: "lamvanhung.dtnt1969@gmail.com",
    phoneNumber: "0901000035",
    departmentName: "Tổ Tự Nhiên",
    major: "Vật lý",
    password: "123"
  },
  {
    userId: "USR-036",
    fullName: "Nguyễn Chơn Nhất Hữu",
    role: UserRole.VICE_PRINCIPAL,
    email: "ncnhuu83@gmail.com",
    phoneNumber: "0901000036",
    departmentName: "Tổ Tự Nhiên",
    major: "Vật lý",
    password: "123"
  },
  {
    userId: "USR-037",
    fullName: "Dư Quốc Kiệt",
    role: UserRole.PRINCIPAL,
    email: "duquockiet@gmail.com",
    phoneNumber: "0901000037",
    departmentName: "Tổ Xã Hội",
    major: "Địa lý",
    password: "123"
  },
  {
    userId: "USR-038",
    fullName: "Phần Bùi Nhi",
    role: UserRole.TEACHER,
    email: "nhib2303837@student.ctu.edu.vn",
    phoneNumber: "0912345678",
    departmentName: "Tổ Tổng Hợp",
    major: "Sư phạm Tin học",
    password: "123"
  }
]
