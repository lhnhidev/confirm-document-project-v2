import type { EvidenceItem } from "../types/auth"
import { EvidenceStatus } from "../types/auth"

export const INITIAL_EVIDENCES: EvidenceItem[] = [
  {
    id: "EV-004",
    evidenceId: "MC-2026-004",
    title: "Sáng kiến kinh nghiệm cấp Trường - Giải pháp chuyển đổi số môn Tin học",
    description: "Báo cáo đề tài giải pháp ứng dụng công nghệ AI hỗ trợ quản lý học sinh nội trú.",
    date: "2026-02-28",
    originalFileName: "SangKien_KinhNghiem_TinHoc_LeThiNgocHon.pdf",
    fileFormat: "application/pdf",
    fileSize: 4200000,
    urlFile: "#",
    currentStatus: EvidenceStatus.PENDING,
    submittedBy: {
      userId: "USR-001",
      fullName: "Lê Thị Ngọc Hơn",
      email: "lethingochon.dtnt@gmail.com",
      departmentName: "Tổng hợp",
      role: "DepartmentHead"
    },
    standardName: "Tiêu chuẩn 2: Phát triển chuyên môn, nghiệp vụ",
    criteriaName: "Tiêu chí 7: Nổi bật trong đổi mới sáng tạo"
  }
]
