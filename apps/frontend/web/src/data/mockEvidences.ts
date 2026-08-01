import type { EvidenceItem } from "../types/auth"
import { EvidenceStatus } from "../types/auth"

export const INITIAL_EVIDENCES: EvidenceItem[] = [
  {
    id: "EV-001",
    evidenceId: "MC-2026-001",
    title: "Quyết định khen thưởng Giáo viên Giỏi cấp Tỉnh 2025",
    description: "Bản scan Quyết định số 142/QĐ-SGDĐT về việc trao chứng nhận Giáo viên Giỏi cấp THPT tỉnh Bạc Liêu.",
    date: "2026-01-15",
    originalFileName: "QuyetDinh_GVDG_2025_TongThiTuyetHue.pdf",
    fileFormat: "application/pdf",
    fileSize: 2450000,
    urlFile: "#",
    currentStatus: EvidenceStatus.APPROVED,
    submittedBy: {
      userId: "USR-002",
      fullName: "Tống Thị Tuyết Huệ",
      email: "ttthuedtnt@gmail.com",
      departmentName: "Tổng hợp"
    },
    standardName: "Tiêu chuẩn 1: Phẩm chất nhà giáo",
    criteriaName: "Tiêu chí 2: Phong cách làm việc",
    reviewComment: "Hồ sơ chính xác, có mấu dấu đỏ đầy đủ của Sở GD&ĐT."
  },
  {
    id: "EV-002",
    evidenceId: "MC-2026-002",
    title: "Chứng chỉ bồi dưỡng Phương pháp Giảng dạy An ninh Quốc phòng 2025",
    description: "Chứng chỉ hoàn thành khóa tập huấn nâng cao nghiệp vụ bộ môn Giáo dục Quốc phòng An ninh năm học 2025-2026.",
    date: "2026-02-10",
    originalFileName: "ChungChi_GDQP_2025.pdf",
    fileFormat: "application/pdf",
    fileSize: 1820000,
    urlFile: "#",
    currentStatus: EvidenceStatus.APPROVED,
    submittedBy: {
      userId: "USR-002",
      fullName: "Tống Thị Tuyết Huệ",
      email: "ttthuedtnt@gmail.com",
      departmentName: "Tổng hợp"
    },
    standardName: "Tiêu chuẩn 2: Phát triển chuyên môn, nghiệp vụ",
    criteriaName: "Tiêu chí 4: Phát triển chuyên môn bản thân",
    reviewComment: "Đáp ứng đầy đủ tiêu chuẩn bồi dưỡng thường xuyên."
  },
  {
    id: "EV-003",
    evidenceId: "MC-2026-003",
    title: "Kế hoạch bài dạy (Giáo án) ứng dụng CNTT Học kỳ I",
    description: "Giáo án điện tử bộ môn Quốc phòng An ninh khối 11 tích hợp bản đồ số và mô phỏng thực hành.",
    date: "2026-03-01",
    originalFileName: "GiaoAn_DienTu_QPAN11_TongThiTuyetHue.docx",
    fileFormat: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    fileSize: 3100000,
    urlFile: "#",
    currentStatus: EvidenceStatus.PENDING,
    submittedBy: {
      userId: "USR-002",
      fullName: "Tống Thị Tuyết Huệ",
      email: "ttthuedtnt@gmail.com",
      departmentName: "Tổng hợp"
    },
    standardName: "Tiêu chuẩn 2: Phát triển chuyên môn, nghiệp vụ",
    criteriaName: "Tiêu chí 5: Xây dựng kế hoạch dạy học và giáo dục"
  },
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
      departmentName: "Tổng hợp"
    },
    standardName: "Tiêu chuẩn 2: Phát triển chuyên môn, nghiệp vụ",
    criteriaName: "Tiêu chí 7: Nổi bật trong đổi mới sáng tạo"
  },
  {
    id: "EV-005",
    evidenceId: "MC-2026-005",
    title: "Biên bản họp phụ huynh và kế hoạch tư vấn tâm lý học sinh năm 2025",
    description: "Hồ sơ công tác chủ nhiệm và phối hợp gia đình - nhà trường.",
    date: "2026-01-20",
    originalFileName: "BienBan_HopPhuHuynh_2025.pdf",
    fileFormat: "application/pdf",
    fileSize: 1500000,
    urlFile: "#",
    currentStatus: EvidenceStatus.NEEDS_SUPPLEMENT,
    submittedBy: {
      userId: "USR-002",
      fullName: "Tống Thị Tuyết Huệ",
      email: "ttthuedtnt@gmail.com",
      departmentName: "Tổng hợp"
    },
    standardName: "Tiêu chuẩn 4: Phát triển mối quan hệ giữa nhà trường, gia đình và xã hội",
    criteriaName: "Tiêu chí 12: Phối hợp giữa nhà trường, gia đình, xã hội",
    reviewComment: "Cần bổ sung thêm chữ ký của Trưởng ban đại diện cha mẹ học sinh."
  }
]
