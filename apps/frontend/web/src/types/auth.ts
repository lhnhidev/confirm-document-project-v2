export const UserRole = {
  TEACHER: "Teacher",
  DEPARTMENT_HEAD: "DepartmentHead",
  SCHOOL_BOARD: "SchoolBoard"
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export interface User {
  userId: string
  fullName: string
  role: UserRole
  email: string
  phoneNumber?: string
  departmentName?: string
  major: string
  rawPassword?: string
}

export const EvidenceStatus = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  NEEDS_SUPPLEMENT: "NeedsSupplement"
} as const

export type EvidenceStatus = (typeof EvidenceStatus)[keyof typeof EvidenceStatus]

export interface EvidenceItem {
  id: string
  evidenceId: string
  title: string
  description?: string
  date: string
  originalFileName: string
  fileFormat: string
  fileSize: number // bytes
  urlFile: string
  currentStatus: EvidenceStatus
  submittedBy: {
    userId: string
    fullName: string
    email: string
    departmentName: string
  }
  standardName: string
  criteriaName: string
  reviewComment?: string
  updatedAt?: string
}
