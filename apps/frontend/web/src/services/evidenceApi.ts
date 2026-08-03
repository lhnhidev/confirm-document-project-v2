import type { EvidenceItem, EvidenceStatus } from "../types/auth"
import { getToken } from "./authApi"

export interface CriterionItem {
  _id?: string
  criteriaId: string
  criteriaName: string
  status?: string
}

export interface FieldItem {
  _id?: string
  fieldCode: string
  fieldName: string
  percent: number
  criteria: CriterionItem[]
}

export interface StatsSummary {
  totalSubmitted: number
  totalApproved: number
  totalPending: number
  totalNeedsSupplement: number
  totalStandardCriteria: number
}

export interface TeacherProgress {
  fullName: string
  email: string
  departmentName: string
  totalSubmitted: number
  approved: number
  pending: number
  needsSupplement: number
  completedCriteriaCount: number
  totalCriteriaCount: number
  completionPercentage: number
}

export interface StatsResponse {
  success: boolean
  summary: StatsSummary
  teacherProgress: TeacherProgress[]
}

export interface TeacherSummaryData {
  totalSubmitted: number
  approvedCount: number
  pendingCount: number
  needsSupplementCount: number
  completedCriteriaCount: number
  totalCriteriaCount: number
  completionPercentage: number
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface TeacherSummaryResponse {
  success: boolean
  teacherInfo: {
    userId: string
    fullName: string
    email: string
    departmentName: string
  }
  summary: TeacherSummaryData
  pagination?: PaginationInfo
  evidences: EvidenceItem[]
}

/**
 * Backend API Call: Lấy dữ liệu tổng quan & danh sách minh chứng của giáo viên đang đăng nhập (có phân trang backend)
 */
export async function getTeacherSummaryApi(params?: {
  page?: number
  limit?: number
  search?: string
  status?: string
  startDate?: string
  endDate?: string
}): Promise<TeacherSummaryResponse | null> {
  const token = getToken()
  try {
    const query = new URLSearchParams()
    if (params?.page) {query.append("page", params.page.toString())}
    if (params?.limit) {query.append("limit", params.limit.toString())}
    if (params?.search) {query.append("search", params.search)}
    if (params?.status && params.status !== "all") {query.append("status", params.status)}
    if (params?.startDate) {query.append("startDate", params.startDate)}
    if (params?.endDate) {query.append("endDate", params.endDate)}

    const response = await fetch(`/api/evidences/my-summary?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    if (!response.ok) {return null}
    const data = await response.json()
    return data.success ? data : null
  } catch (err) {
    console.error("❌ Error fetching teacher summary from backend API:", err)
    return null
  }
}

/**
 * Backend API Call: Lấy số lượng minh chứng bị yêu cầu bổ sung của giáo viên đang đăng nhập
 */
export async function getMySupplementCountApi(): Promise<number> {
  const token = getToken()
  try {
    const response = await fetch("/api/evidences/my-supplement-count", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    if (!response.ok) { return 0 }
    const data = await response.json()
    return data.success ? data.needsSupplementCount : 0
  } catch (err) {
    console.error("❌ Error fetching supplement count from backend API:", err)
    return 0
  }
}

/**
 * Backend API Call: Lấy riêng danh sách minh chứng của giáo viên đang đăng nhập theo trang & bộ lọc
 */
export async function getTeacherEvidencesApi(params?: {
  page?: number
  limit?: number
  search?: string
  status?: string
}): Promise<{
  success: boolean
  pagination: PaginationInfo
  evidences: EvidenceItem[]
} | null> {
  const token = getToken()
  try {
    const query = new URLSearchParams()
    if (params?.page) {query.append("page", params.page.toString())}
    if (params?.limit) {query.append("limit", params.limit.toString())}
    if (params?.search) {query.append("search", params.search)}
    if (params?.status && params.status !== "all") {query.append("status", params.status)}

    const response = await fetch(`/api/evidences/my-evidences?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    if (!response.ok) {return null}
    const data = await response.json()
    return data.success ? data : null
  } catch (err) {
    console.error("❌ Error fetching teacher evidences from backend API:", err)
    return null
  }
}

/**
 * Backend API Call: Lấy danh sách Tiêu chuẩn & Tiêu chí của người dùng hiện tại
 */
export async function getFieldsAndCriteria(): Promise<FieldItem[]> {
  const token = getToken()
  try {
    const response = await fetch("/api/fields/my-fields", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    if (!response.ok) {return []}
    const data = await response.json()
    return data.success ? data.fields : []
  } catch (err) {
    console.error("❌ Error fetching fields from backend API:", err)
    return []
  }
}

/**
 * Backend API Call: Reset toàn bộ tiêu chí của người dùng về trạng thái chưa hoàn thành
 */
export async function resetCriteriaApi(): Promise<FieldItem[]> {
  const token = getToken()
  try {
    const response = await fetch("/api/fields/reset-criteria", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    if (!response.ok) {return []}
    const data = await response.json()
    return data.success ? data.fields : []
  } catch (err) {
    console.error("❌ Error resetting criteria in backend API:", err)
    return []
  }
}

/**
 * Backend API Call: Lấy Thống kê tổng hợp minh chứng và tiến độ tiêu chí giáo viên
 */
export async function getEvidenceStats(): Promise<StatsResponse | null> {
  const token = getToken()
  try {
    const response = await fetch("/api/evidences/stats", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    if (!response.ok) {return null}
    const data = await response.json()
    return data.success ? data : null
  } catch (err) {
    console.error("❌ Error fetching stats from backend API:", err)
    return null
  }
}

/**
 * Backend API Call: Lấy toàn bộ danh sách minh chứng
 */
export async function fetchEvidencesApi(): Promise<EvidenceItem[]> {
  const token = getToken()
  try {
    const response = await fetch("/api/evidences", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    if (!response.ok) {return []}
    const data = await response.json()
    return data.success ? data.evidences : []
  } catch (err) {
    console.error("❌ Error fetching evidences from backend API:", err)
    return []
  }
}

/**
 * Backend API Call: Nộp minh chứng mới (gửi kèm FormData lên Cloudflare R2 hoặc JSON)
 */
export async function submitEvidenceApi(
  payload: FormData | Omit<EvidenceItem, "id" | "evidenceId" | "submittedBy">
): Promise<EvidenceItem | null> {
  const token = getToken()
  try {
    let body: FormData | string
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`
    }

    if (payload instanceof FormData) {
      body = payload
    } else {
      headers["Content-Type"] = "application/json"
      body = JSON.stringify(payload)
    }

    const response = await fetch("/api/evidences", {
      method: "POST",
      headers,
      body
    })
    if (!response.ok) {return null}
    const data = await response.json()
    return data.success ? data.evidence : null
  } catch (err) {
    console.error("❌ Error submitting evidence to backend API:", err)
    return null
  }
}

/**
 * Backend API Call: Cập nhật trạng thái duyệt minh chứng
 */
export async function updateEvidenceStatusApi(
  id: string,
  status: EvidenceStatus,
  reviewComment?: string
): Promise<boolean> {
  const token = getToken()
  try {
    const response = await fetch(`/api/evidences/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status, reviewComment })
    })
    return response.ok
  } catch (err) {
    console.error("❌ Error updating evidence status in backend API:", err)
    return false
  }
}

/**
 * Backend API Call: Xóa minh chứng
 */
export async function deleteEvidenceApi(id: string): Promise<boolean> {
  const token = getToken()
  try {
    const response = await fetch(`/api/evidences/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.ok
  } catch (err) {
    console.error("❌ Error deleting evidence in backend API:", err)
    return false
  }
}

/**
 * Backend API Call: Chỉnh sửa / Bổ sung nội dung minh chứng
 */
export async function updateEvidenceApi(
  id: string,
  payload: FormData
): Promise<boolean> {
  const token = getToken()
  try {
    const response = await fetch(`/api/evidences/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: payload
    })
    return response.ok
  } catch (err) {
    console.error("❌ Error updating evidence content in backend API:", err)
    return false
  }
}
