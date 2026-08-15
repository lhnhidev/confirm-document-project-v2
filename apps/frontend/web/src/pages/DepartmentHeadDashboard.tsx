/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react"
import {
  Title,
  Text,
  Button,
  Paper,
  Badge,
  Table,
  Group,
  TextInput,
  Modal,
  Textarea,
  Tabs,
  Avatar,
  Progress,
  Card,
  Select,
  FileInput,
  Alert,
  ActionIcon
} from "@mantine/core"
import {
  IconCheck,
  IconClock,
  IconAlertTriangle,
  IconSearch,
  IconEye,
  IconUsers,
  IconBuildingSkyscraper,
  IconCertificate,
  IconTable,
  IconDownload,
  IconExternalLink,
  IconFileText,
  IconLink,
  IconMessage,
  IconSend,
  IconFileUpload,
  IconTrash,
  IconArchive,
  IconPlus
} from "@tabler/icons-react"
import {
  addCommentApi,
  deleteCommentApi,
  getFieldsAndCriteria,
  deleteEvidenceApi,
  updateEvidenceApi,
  fetchEvidencesApi,
  updateEvidenceStatusApi,
  getEvidenceStats,
  type FieldItem,
  type TeacherProgress
} from "../services/evidenceApi"
import type { User, EvidenceItem, EvidenceStatus, AttachmentItem } from "../types/auth"
import { EvidenceStatus as EvidenceStatusValues, UserRole } from "../types/auth"
import AppHeader from "../components/AppHeader"
import CriteriaMatrixTable from "../components/CriteriaMatrixTable"
import UserContactsTab from "../components/UserContactsTab"

interface DepartmentHeadDashboardProps {
  currentUser: User
  evidences: EvidenceItem[]
  onUpdateStatus: (_id: string, _status: EvidenceStatus, _comment?: string) => void
  onLogout: () => void
  onUserUpdate?: (_updatedUser: User) => void
  onUpdateEvidence?: (updatedItem: EvidenceItem) => void
  onAddEvidence: (_payload: FormData) => void
}

const FRONTEND_FALLBACK_FIELDS: FieldItem[] = [
  {
    fieldCode: "I",
    fieldName: "NĂNG LỰC SỬ DỤNG CÔNG NGHỆ SỐ",
    percent: 0,
    criteria: [
      { criteriaId: "TC101", criteriaName: "Vận hành thiết bị số phục vụ công việc chuyên môn" },
      { criteriaId: "TC102", criteriaName: "Quản lý dữ liệu và tài nguyên số phục vụ giảng dạy" },
      { criteriaId: "TC103", criteriaName: "Thực hiện giao tiếp số trong công việc" },
      { criteriaId: "TC104", criteriaName: "Sử dụng nền tảng trực tuyến(zoom, google meet,Microsoft Teams..)" },
      { criteriaId: "TC105", criteriaName: "Tìm kiếm và khai thác thông tin số" }
    ]
  },
  {
    fieldCode: "II",
    fieldName: "THIẾT KẾ HỌC LIỆU SỐ",
    percent: 0,
    criteria: [
      { criteriaId: "TC201", criteriaName: "Thiết kế học liệu số" },
      { criteriaId: "TC202", criteriaName: "Thiết kế bài trình chiếu số" },
      { criteriaId: "TC203", criteriaName: "Thiết kế video bài giảng số" },
      { criteriaId: "TC204", criteriaName: "Thiết kế học liệu số tương tác" },
      { criteriaId: "TC205", criteriaName: "Quản lý học liệu số" }
    ]
  },
  {
    fieldCode: "III",
    fieldName: "TỔ CHỨC DẠY HỌC SỐ",
    percent: 0,
    criteria: [
      { criteriaId: "TC301", criteriaName: "Sử dụng nền tảng số trong tổ chức dạy học" },
      { criteriaId: "TC302", criteriaName: "Giao và thu nhận nhiệm vụ học tập trực tuyến" },
      { criteriaId: "TC303", criteriaName: "Quản lý lớp học trên môi trường số" },
      { criteriaId: "TC304", criteriaName: "Theo dõi và hỗ trợ tiến độ học tập" },
      { criteriaId: "TC305", criteriaName: "Tương tác và trao đổi với người học trên môi trường số" }
    ]
  },
  {
    fieldCode: "IV",
    fieldName: "KIỂM TRA, ĐÁNH GIÁ",
    percent: 0,
    criteria: [
      { criteriaId: "TC401", criteriaName: "Tổ chức kiểm tra, đánh giá trên môi trường số" },
      { criteriaId: "TC402", criteriaName: "Xây dựng và quản lý ngân hàng câu hỏi số" },
      { criteriaId: "TC403", criteriaName: "Phân tích kết quả đánh giá bằng công cụ số" },
      { criteriaId: "TC404", criteriaName: "Phản hồi kết quả học tập trên môi trường số" },
      { criteriaId: "TC405", criteriaName: "Quản lý và lưu trữ kết quả đánh giá số" }
    ]
  },
  {
    fieldCode: "V",
    fieldName: "ỨNG DỤNG AI",
    percent: 0,
    criteria: [
      { criteriaId: "TC501", criteriaName: "AI hỗ trợ soạn bài" },
      { criteriaId: "TC502", criteriaName: "AI tạo câu hỏi" },
      { criteriaId: "TC503", criteriaName: "AI tạo học liệu" },
      { criteriaId: "TC504", criteriaName: "Ứng dụng AI trong phân tích dữ liệu giáo dục" },
      { criteriaId: "TC505", criteriaName: "Sử dụng AI có trách nhiệm và đạo đức" }
    ]
  },
  {
    fieldCode: "VI",
    fieldName: "AN TOÀN, BẢO MẬT VÀ ĐẠO ĐỨC SỐ",
    percent: 0,
    criteria: [
      { criteriaId: "TC601", criteriaName: "Bảo vệ tài khoản" },
      { criteriaId: "TC602", criteriaName: "Bảo vệ dữ liệu" },
      { criteriaId: "TC603", criteriaName: "Bản quyền số" },
      { criteriaId: "TC604", criteriaName: "Ứng xử số" }
    ]
  },
  {
    fieldCode: "VII",
    fieldName: "CHIA SẺ, PHÁT TRIỂN CHUYÊN MÔN",
    percent: 0,
    criteria: [
      { criteriaId: "TC701", criteriaName: "Chia sẻ học liệu số và kinh nghiệm chuyên môn" },
      { criteriaId: "TC702", criteriaName: "Hỗ trợ đồng nghiệp" },
      { criteriaId: "TC703", criteriaName: "Tham gia tập huấn" },
      { criteriaId: "TC704", criteriaName: "Cộng đồng học tập" }
    ]
  },
  {
    fieldCode: "VIII",
    fieldName: "ĐỔI MỚI SÁNG TẠO",
    percent: 0,
    criteria: [
      { criteriaId: "TC801", criteriaName: "Sáng kiến/chuyển đổi số" },
      { criteriaId: "TC802", criteriaName: "Tham gia dự án số" }
    ]
  }
]

export default function DepartmentHeadDashboard({
  currentUser,
  evidences,
  onUpdateStatus,
  onLogout,
  onUserUpdate,
  onUpdateEvidence,
  onAddEvidence
}: DepartmentHeadDashboardProps) {
  const nowTime = Date.now()
  const isViceHead = currentUser.role === UserRole.DEPARTMENT_VICE_HEAD
  const roleTitle = isViceHead ? "Tổ phó" : "Tổ trưởng"

  const [localEvidences, setLocalEvidences] = useState<EvidenceItem[]>(evidences || [])
  const [teacherProgressList, setTeacherProgressList] = useState<TeacherProgress[]>([])

  const [activeTab, setActiveTab] = useState<string>("pending")
  const [pendingSearchQuery, setPendingSearchQuery] = useState("")
  const [reviewedSearchQuery, setReviewedSearchQuery] = useState("")
  const [teacherSearchQuery, setTeacherSearchQuery] = useState("")
  const [reviewedStatusFilter, setReviewedStatusFilter] = useState<string>("ALL")
  const [reviewedDateRangeFilter, setReviewedDateRangeFilter] = useState<string>("ALL")
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null)
  const [reviewComment, setReviewComment] = useState("")
  const [activeAttachmentIdx, setActiveAttachmentIdx] = useState<number>(0)
  
  // Comments Timeline States
  const [newCommentText, setNewCommentText] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [modalTab, setModalTab] = useState<string>("details")

  // Matrix submission states for Department Head / Vice Head
  const [modalOpened, setModalOpened] = useState(false)
  const [editingEvidence, setEditingEvidence] = useState<EvidenceItem | null>(null)
  const [deleteModalOpened, setDeleteModalOpened] = useState(false)
  const [evidenceToDelete, setEvidenceToDelete] = useState<EvidenceItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [standardName, setStandardName] = useState("NĂNG LỰC SỬ DỤNG CÔNG NGHỆ SỐ")
  const [criteriaName, setCriteriaName] = useState("Vận hành thiết bị số phục vụ công việc chuyên môn")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [evidenceLinks, setEvidenceLinks] = useState<string[]>([])
  const [currentLink, setCurrentLink] = useState("")
  const [existingAttachments, setExistingAttachments] = useState<AttachmentItem[]>([])
  const [fileError, setFileError] = useState<string | null>(null)
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null)
  const [notificationTimeoutId, setNotificationTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null)
  const [fields, setFields] = useState<FieldItem[]>(FRONTEND_FALLBACK_FIELDS)

  // Sync prop changes to localEvidences
  useEffect(() => {
    if (evidences && evidences.length > 0) {
      setLocalEvidences(evidences)
    }
  }, [evidences])

  const refreshDepartmentData = async () => {
    try {
      const [fetchedEvs, statsRes] = await Promise.all([
        fetchEvidencesApi(),
        getEvidenceStats()
      ])
      if (fetchedEvs && fetchedEvs.length > 0) {
        setLocalEvidences(fetchedEvs)
      }
      if (statsRes?.teacherProgress) {
        setTeacherProgressList(statsRes.teacherProgress)
      }
    } catch (err) {
      console.error("❌ Error fetching department data:", err)
    }
  }

  useEffect(() => {
    refreshDepartmentData()
  }, [])

  useEffect(() => {
    getFieldsAndCriteria().then((res) => {
      if (res && res.length > 0) {
        setFields(res)
        setStandardName(res[0].fieldName)
        if (res[0].criteria && res[0].criteria.length > 0) {
          setCriteriaName(res[0].criteria[0].criteriaName)
        }
      }
    })
  }, [])

  const handleAddComment = async () => {
    if (!newCommentText.trim() || !selectedEvidence) return
    setIsSubmittingComment(true)
    const updated = await addCommentApi(selectedEvidence.id, newCommentText)
    if (updated) {
      setNewCommentText("")
      setSelectedEvidence(updated)
      setLocalEvidences((prev) =>
        prev.map((e) => (e.id === updated.id || e.evidenceId === updated.id ? updated : e))
      )
      if (onUpdateEvidence) {
        onUpdateEvidence(updated)
      }
    }
    setIsSubmittingComment(false)
  }

  const handleRecallComment = async (commentId: string) => {
    if (!selectedEvidence) return
    const updated = await deleteCommentApi(selectedEvidence.id, commentId)
    if (updated) {
      setSelectedEvidence(updated)
      setLocalEvidences((prev) =>
        prev.map((e) => (e.id === updated.id || e.evidenceId === updated.id ? updated : e))
      )
      if (onUpdateEvidence) {
        onUpdateEvidence(updated)
      }
    }
  }

  const handleDownload = (url: string, filename: string) => {
    if (!url || url === "#") {
      return
    }
    window.location.href = `/api/evidences/download-proxy?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`
  }

  const normalize = (str?: string) => (str || "").trim().toLowerCase()

  const isCurrentDept = (deptName?: string) => {
    if (!deptName || !currentUser.departmentName) return false
    return normalize(deptName) === normalize(currentUser.departmentName)
  }

  // Pending and evaluated evidences of teachers in this department (excluding current user's own submissions)
  const departmentEvidences = localEvidences.filter((e) => {
    if (!e || !e.submittedBy) return false
    const sameDept = isCurrentDept(e.submittedBy.departmentName)
    const notMe = e.submittedBy.userId !== currentUser.userId &&
                  normalize(e.submittedBy.email) !== normalize(currentUser.email)
    return sameDept && notMe
  })

  const pendingEvidences = departmentEvidences.filter(
    (e) => e.currentStatus === EvidenceStatusValues.PENDING
  )

  const filteredPendingEvidences = pendingEvidences.filter((item) => {
    if (!pendingSearchQuery.trim()) return true
    const q = pendingSearchQuery.toLowerCase().trim()
    const nameMatch = item.submittedBy?.fullName?.toLowerCase().includes(q) || false
    const emailMatch = item.submittedBy?.email ? item.submittedBy.email.toLowerCase().includes(q) : false
    const codeMatch = item.evidenceId ? item.evidenceId.toLowerCase().includes(q) : false
    const titleMatch = item.title ? item.title.toLowerCase().includes(q) : false
    return nameMatch || emailMatch || codeMatch || titleMatch
  })

  const reviewedEvidences = departmentEvidences.filter(
    (e) => e.currentStatus !== EvidenceStatusValues.PENDING
  )

  const filteredReviewedEvidences = reviewedEvidences.filter((item) => {
    // 1. Search Query filter
    if (reviewedSearchQuery.trim()) {
      const q = reviewedSearchQuery.toLowerCase().trim()
      const nameMatch = item.submittedBy?.fullName?.toLowerCase().includes(q) || false
      const emailMatch = item.submittedBy?.email ? item.submittedBy.email.toLowerCase().includes(q) : false
      const codeMatch = item.evidenceId ? item.evidenceId.toLowerCase().includes(q) : false
      const titleMatch = item.title ? item.title.toLowerCase().includes(q) : false
      if (!nameMatch && !emailMatch && !codeMatch && !titleMatch) return false
    }

    // 2. Status filter
    if (reviewedStatusFilter !== "ALL") {
      if (item.currentStatus !== reviewedStatusFilter) return false
    }

    // 3. Date Range filter
    if (reviewedDateRangeFilter !== "ALL") {
      const itemDate = new Date(item.date || Date.now()).getTime()
      const now = Date.now()
      const diffDays = (now - itemDate) / (1000 * 60 * 60 * 24)

      if (reviewedDateRangeFilter === "7DAYS" && diffDays > 7) return false
      if (reviewedDateRangeFilter === "30DAYS" && diffDays > 30) return false
      if (reviewedDateRangeFilter === "90DAYS" && diffDays > 90) return false
      if (reviewedDateRangeFilter === "THIS_YEAR") {
        const itemYear = new Date(item.date || Date.now()).getFullYear()
        const currentYear = new Date().getFullYear()
        if (itemYear !== currentYear) return false
      }
    }

    return true
  })

  const filteredList = activeTab === "pending" ? filteredPendingEvidences : filteredReviewedEvidences

  // Teachers in this department (derived from live teacherProgressList from backend API)
  const currentDeptTeachers = teacherProgressList.filter(
    (t) => isCurrentDept(t.departmentName) && normalize(t.email) !== normalize(currentUser.email)
  )

  // Fallback if stats are still loading or empty
  const fallbackDepartmentTeachers = [
    {
      fullName: "Tống Thị Tuyết Huệ",
      email: "ttthuedtnt@gmail.com",
      departmentName: currentUser.departmentName || "Tổ Tổng Hợp",
      totalSubmitted: 4,
      approved: 2,
      pending: 1,
      needsSupplement: 1,
      completedCriteriaCount: 2,
      totalCriteriaCount: 35,
      completionPercentage: 80
    },
    {
      fullName: "Lê Thị Ngọc Hơn",
      email: "lethingochon.dtnt@gmail.com",
      departmentName: currentUser.departmentName || "Tổ Tổng Hợp",
      totalSubmitted: 6,
      approved: 5,
      pending: 1,
      needsSupplement: 0,
      completedCriteriaCount: 5,
      totalCriteriaCount: 35,
      completionPercentage: 92
    },
    {
      fullName: "Nguyễn Văn An",
      email: "nguyenvanan@baclieu.edu.vn",
      departmentName: currentUser.departmentName || "Tổ Tổng Hợp",
      totalSubmitted: 3,
      approved: 3,
      pending: 0,
      needsSupplement: 0,
      completedCriteriaCount: 3,
      totalCriteriaCount: 35,
      completionPercentage: 100
    }
  ]

  const displayTeachers = currentDeptTeachers.length > 0 ? currentDeptTeachers : fallbackDepartmentTeachers

  const filteredDepartmentTeachers = displayTeachers.filter((teacher) => {
    if (!teacherSearchQuery.trim()) return true
    const q = teacherSearchQuery.toLowerCase().trim()
    const nameMatch = teacher.fullName.toLowerCase().includes(q)
    const emailMatch = teacher.email.toLowerCase().includes(q)
    return nameMatch || emailMatch
  })

  const handleApprove = async (evidence: EvidenceItem) => {
    setIsSubmittingReview(true)
    const comment = reviewComment.trim() || `${roleTitle} đã duyệt minh chứng đạt chuẩn.`
    const success = await updateEvidenceStatusApi(evidence.id, EvidenceStatusValues.APPROVED, comment)
    
    if (success) {
      onUpdateStatus(evidence.id, EvidenceStatusValues.APPROVED, comment)
      setLocalEvidences((prev) =>
        prev.map((item) =>
          item.id === evidence.id || item.evidenceId === evidence.id
            ? {
                ...item,
                currentStatus: EvidenceStatusValues.APPROVED,
                reviewComment: comment
              }
            : item
        )
      )

      setNotificationMessage(`✅ Đã phê duyệt minh chứng ${evidence.evidenceId} thành công!`)
      if (notificationTimeoutId) clearTimeout(notificationTimeoutId)
      const tId = setTimeout(() => setNotificationMessage(null), 4000)
      setNotificationTimeoutId(tId)
    }

    setIsSubmittingReview(false)
    setSelectedEvidence(null)
    setReviewComment("")
    refreshDepartmentData()
  }

  const handleRequestSupplement = async (evidence: EvidenceItem) => {
    setIsSubmittingReview(true)
    const comment = reviewComment.trim() || `${roleTitle} yêu cầu bổ sung minh chứng chi tiết.`
    const success = await updateEvidenceStatusApi(evidence.id, EvidenceStatusValues.NEEDS_SUPPLEMENT, comment)

    if (success) {
      onUpdateStatus(evidence.id, EvidenceStatusValues.NEEDS_SUPPLEMENT, comment)
      setLocalEvidences((prev) =>
        prev.map((item) =>
          item.id === evidence.id || item.evidenceId === evidence.id
            ? {
                ...item,
                currentStatus: EvidenceStatusValues.NEEDS_SUPPLEMENT,
                reviewComment: comment
              }
            : item
        )
      )

      setNotificationMessage(`⚠️ Đã gửi yêu cầu bổ sung cho minh chứng ${evidence.evidenceId}!`)
      if (notificationTimeoutId) clearTimeout(notificationTimeoutId)
      const tId = setTimeout(() => setNotificationMessage(null), 4000)
      setNotificationTimeoutId(tId)
    }

    setIsSubmittingReview(false)
    setSelectedEvidence(null)
    setReviewComment("")
    refreshDepartmentData()
  }

  const headEvidences = localEvidences.filter(
    (e) => e.submittedBy?.userId === currentUser.userId || normalize(e.submittedBy?.email) === normalize(currentUser.email)
  )

  const getCriterionSelectableStatus = (c: { criteriaId: string; criteriaName: string; status?: string }) => {
    const hasNeedsSupplement = headEvidences.some((e) => {
      if (!e) return false
      const isMatch = e.criteriaName === c.criteriaName || 
                      (e.criteriaName && (e.criteriaName.includes(c.criteriaId) || c.criteriaName.includes(e.criteriaName)))
      return isMatch && e.currentStatus === EvidenceStatusValues.NEEDS_SUPPLEMENT
    })

    if (hasNeedsSupplement) {
      return { selectable: false, reason: "Yêu cầu bổ sung" }
    }

    return { selectable: true, reason: "" }
  }

  const getCriterionBlockedStatus = (c: { criteriaId: string; criteriaName: string; status?: string }) => {
    if (c.status === "approved" || c.status === "APPROVED") {
      return { blocked: true, statusText: "đã được duyệt", labelStatus: "Đã duyệt" }
    }
    if (c.status === "pending" || c.status === "PENDING") {
      return { blocked: true, statusText: "đang chờ duyệt", labelStatus: "Chờ duyệt" }
    }

    const matching = headEvidences.find((e) => {
      if (!e) return false
      return (
        e.criteriaName === c.criteriaName ||
        (e.criteriaName && (e.criteriaName.includes(c.criteriaId) || c.criteriaName.includes(e.criteriaName)))
      )
    })

    if (matching) {
      if (matching.currentStatus === EvidenceStatusValues.APPROVED) {
        return { blocked: true, statusText: "đã được duyệt", labelStatus: "Đã duyệt" }
      }
      if (matching.currentStatus === EvidenceStatusValues.PENDING) {
        return { blocked: true, statusText: "đang chờ duyệt", labelStatus: "Chờ duyệt" }
      }
    }

    return { blocked: false, statusText: "", labelStatus: "" }
  }

  const isCriterionBlocked = (cName: string) => {
    for (const f of fields) {
      if (!f.criteria) continue
      const c = f.criteria.find(
        (crit) =>
          crit.criteriaName === cName ||
          crit.criteriaId === cName ||
          cName.includes(crit.criteriaId) ||
          crit.criteriaName.includes(cName)
      )
      if (c) {
        const res = getCriterionSelectableStatus(c)
        if (!res.selectable) return true
      }
    }

    return headEvidences.some(
      (e) =>
        e.criteriaName &&
        (e.criteriaName === cName || cName.includes(e.criteriaName) || e.criteriaName.includes(cName)) &&
        (e.currentStatus === EvidenceStatusValues.APPROVED || 
         e.currentStatus === EvidenceStatusValues.PENDING ||
         e.currentStatus === EvidenceStatusValues.NEEDS_SUPPLEMENT)
    )
  }

  const isStandardBlocked = (field: FieldItem) => {
    if (!field || !field.criteria || field.criteria.length === 0) {
      return false
    }
    return field.criteria.every((c) => !getCriterionSelectableStatus(c).selectable)
  }

  const handleOpenAddModal = async () => {
    setEditingEvidence(null)
    setTitle("")
    setDescription("")
    setSelectedFiles([])
    setEvidenceLinks([])
    setCurrentLink("")
    setFileError(null)

    let currentFields = fields
    const latestFields = await getFieldsAndCriteria()
    if (latestFields && latestFields.length > 0) {
      setFields(latestFields)
      currentFields = latestFields
    }

    const firstStandardWithUnblocked = currentFields.find((f) =>
      f.criteria && f.criteria.some((c) => getCriterionSelectableStatus(c).selectable)
    )

    if (firstStandardWithUnblocked) {
      setStandardName(firstStandardWithUnblocked.fieldName)
      const firstUnblocked = firstStandardWithUnblocked.criteria.find(
        (c) => getCriterionSelectableStatus(c).selectable
      )
      if (firstUnblocked) {
        setCriteriaName(firstUnblocked.criteriaName)
      }
    } else if (currentFields.length > 0) {
      setStandardName(currentFields[0].fieldName)
      if (currentFields[0].criteria && currentFields[0].criteria.length > 0) {
        setCriteriaName(currentFields[0].criteria[0].criteriaName)
      }
    }
    setModalOpened(true)
  }

  const handleOpenAddModalForCriterion = async (stdName: string, critName: string) => {
    setEditingEvidence(null)
    setTitle("")
    setDescription("")
    setSelectedFiles([])
    setEvidenceLinks([])
    setCurrentLink("")
    setFileError(null)

    const latestFields = await getFieldsAndCriteria()
    if (latestFields && latestFields.length > 0) {
      setFields(latestFields)
    }

    setStandardName(stdName)
    setCriteriaName(critName)
    setModalOpened(true)
  }

  const handleEditEvidence = async (item: EvidenceItem) => {
    setEditingEvidence(item)
    setTitle(item.title)
    setDescription(item.description || "")
    setStandardName(item.standardName)
    
    const cleanCriteriaName = item.criteriaName && item.criteriaName.includes(". ")
      ? item.criteriaName.substring(item.criteriaName.indexOf(". ") + 2)
      : item.criteriaName
    setCriteriaName(cleanCriteriaName)

    setSelectedFiles([])
    setEvidenceLinks([])
    setCurrentLink("")
    setFileError(null)

    const initialAttachments = item.attachments && item.attachments.length > 0
      ? item.attachments
      : (item.urlFile && item.urlFile !== "#" ? [{
          name: item.originalFileName || "Minh chứng",
          url: item.urlFile,
          format: item.fileFormat || "unknown",
          size: item.fileSize || 0
        }] : []);
    setExistingAttachments(initialAttachments)

    const latestFields = await getFieldsAndCriteria()
    if (latestFields && latestFields.length > 0) {
      setFields(latestFields)
    }

    setModalOpened(true)
  }

  const handleDeleteEvidence = (item: EvidenceItem) => {
    setEvidenceToDelete(item)
    setDeleteModalOpened(true)
  }

  const confirmDeleteEvidence = async () => {
    if (!evidenceToDelete) return
    setIsDeleting(true)
    const idToDelete = evidenceToDelete.id || evidenceToDelete.evidenceId
    await deleteEvidenceApi(idToDelete)
    setIsDeleting(false)
    setDeleteModalOpened(false)
    setEvidenceToDelete(null)
  }

  const standardOptions = fields.map((f) => {
    const blocked = isStandardBlocked(f)
    let suffix = ""
    if (blocked) {
      suffix = " [🔒 Đã hoàn thành/Chờ duyệt]"
    }
    return {
      value: f.fieldName,
      label: `Tiêu chuẩn ${f.fieldCode}: ${f.fieldName}${suffix}`,
      disabled: blocked
    }
  })

  const selectedFieldObj = fields.find((f) => f.fieldName === standardName) || fields[0]
  const criteriaOptions = selectedFieldObj && selectedFieldObj.criteria
    ? selectedFieldObj.criteria
      .filter((c) => {
        if (editingEvidence) return true
        const selectableInfo = getCriterionSelectableStatus(c)
        return selectableInfo.selectable
      })
      .map((c) => {
        const statusInfo = getCriterionBlockedStatus(c)
        let suffix = ""
        if (statusInfo.blocked) {
          suffix = ` [🔒 ${statusInfo.labelStatus}]`
        }
        return {
          value: c.criteriaName,
          label: `${c.criteriaId}: ${c.criteriaName}${suffix}`,
          disabled: statusInfo.blocked
        }
      })
    : []

  const handleFileChange = (files: File[] | File | null) => {
    setFileError(null)
    if (!files) {
      setSelectedFiles([])
      return
    }
    const filesArray = Array.isArray(files) ? files : [files]
    setSelectedFiles(filesArray)
  }

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
  }

  const addLinkToList = () => {
    if (!currentLink.trim()) return
    if (!currentLink.trim().startsWith("http://") && !currentLink.trim().startsWith("https://")) {
      setFileError("Đường liên kết phải bắt đầu bằng http:// hoặc https://")
      return
    }
    setFileError(null)
    if (evidenceLinks.includes(currentLink.trim())) {
      setFileError("Đường liên kết này đã có trong danh sách!")
      return
    }
    setEvidenceLinks([...evidenceLinks, currentLink.trim()])
    setCurrentLink("")
  }

  const removeLinkFromList = (index: number) => {
    setEvidenceLinks(evidenceLinks.filter((_, i) => i !== index))
  }

  const removeExistingAttachment = (index: number) => {
    setExistingAttachments(existingAttachments.filter((_, i) => i !== index))
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return
    
    const totalNewFiles = selectedFiles?.length || 0
    const totalNewLinks = evidenceLinks?.length || 0
    const totalExisting = editingEvidence ? existingAttachments?.length || 0 : 0
    
    if (totalNewFiles === 0 && totalNewLinks === 0 && totalExisting === 0) {
      setFileError("Vui lòng đính kèm ít nhất 1 tệp tin hoặc thêm 1 đường liên kết minh chứng!")
      return
    }

    if (fileError) return

    if (!editingEvidence && isCriterionBlocked(criteriaName)) {
      let statusText = "đã được duyệt hoặc đang chờ duyệt"
      for (const f of fields) {
        if (!f.criteria) continue
        const c = f.criteria.find((crit) => crit.criteriaName === criteriaName || criteriaName.includes(crit.criteriaId))
        if (c) {
          const res = getCriterionBlockedStatus(c)
          if (res.statusText) statusText = res.statusText
        }
      }
      setNotificationMessage(`Tiêu chí này ${statusText}. Vui lòng không nộp thêm minh chứng cho tiêu chí này!`)
      if (notificationTimeoutId) {
        clearTimeout(notificationTimeoutId)
      }
      const timeoutId = setTimeout(() => {
        setNotificationMessage(null)
      }, 4000)
      setNotificationTimeoutId(timeoutId)
      return
    }

    const selectedFieldObj = fields.find((f) => f.fieldName === standardName) || fields[0]
    const fieldCode = selectedFieldObj ? selectedFieldObj.fieldCode : "I"
    const selectedCritObj = selectedFieldObj?.criteria.find((c) => c.criteriaName === criteriaName)
    const criteriaId = selectedCritObj ? selectedCritObj.criteriaId : "TC101"

    const formData = new FormData()
    formData.append("title", title)
    formData.append("description", description || "")
    formData.append("standardName", standardName)
    formData.append("fieldCode", fieldCode)
    formData.append("criteriaName", criteriaName)
    formData.append("criteriaId", criteriaId)

    if (selectedFiles && selectedFiles.length > 0) {
      selectedFiles.forEach((file) => {
        formData.append("files", file)
      })
    }

    if (evidenceLinks && evidenceLinks.length > 0) {
      formData.append("links", JSON.stringify(evidenceLinks))
    }

    if (editingEvidence) {
      formData.append("existingAttachments", JSON.stringify(existingAttachments))
    }

    let successMsg: string
    if (editingEvidence) {
      await updateEvidenceApi(editingEvidence.id || editingEvidence.evidenceId, formData)
      successMsg = "Đã cập nhật minh chứng thành công!"
      if (onUpdateEvidence) {
        // Refresh updated item in list or trigger state update
      }
    } else {
      await onAddEvidence(formData)
      successMsg = "Đã nộp minh chứng thành công!"
    }

    setTitle("")
    setDescription("")
    setSelectedFiles([])
    setEvidenceLinks([])
    setCurrentLink("")
    setExistingAttachments([])
    setFileError(null)
    setEditingEvidence(null)
    setModalOpened(false)

    setNotificationMessage(successMsg)
    const timeoutId = setTimeout(() => {
      setNotificationMessage(null)
    }, 4000)
    setNotificationTimeoutId(timeoutId)
    window.location.reload()
  }

  const deptApprovedCount = departmentEvidences.filter((e) => e.currentStatus === EvidenceStatusValues.APPROVED).length
  const deptTotalCount = departmentEvidences.length
  const deptApprovalRate = deptTotalCount > 0 ? Math.round((deptApprovedCount / deptTotalCount) * 100) : 100

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-12">
      <AppHeader currentUser={currentUser} onLogout={onLogout} onUserUpdate={onUserUpdate} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {notificationMessage && (
          <Alert color="blue" variant="filled" withCloseButton onClose={() => setNotificationMessage(null)} className="shadow-md animate-fade-in">
            {notificationMessage}
          </Alert>
        )}

        {/* Banner Welcome Card */}
        <Paper className="p-6 sm:p-8 bg-brand-gradient text-white shadow-lg rounded-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center space-x-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200 border border-emerald-400/30">
                <IconBuildingSkyscraper size={14} />
                <span>Cổng Thẩm Định Tổ Chuyên Môn • {currentUser.departmentName || "Tổ chuyên môn"}</span>
              </div>
              <Title order={2} className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {roleTitle}: {currentUser.fullName}
              </Title>
              <Text size="sm" className="text-slate-300">
                Chịu trách nhiệm thẩm định & đánh giá minh chứng sư phạm của giáo viên thuộc Tổ {currentUser.departmentName || "chuyên môn"}.
              </Text>
            </div>

            <Badge size="xl" color="emerald" variant="filled" className="shrink-0 font-bold shadow-md">
              Tỷ lệ thẩm định tổ: {deptApprovalRate}%
            </Badge>
          </div>
        </Paper>

        {/* Overview Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card padding="lg" radius="lg" className="border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <Text size="xs" c="dimmed" fw={600} className="uppercase tracking-wider">
                  Cần Thẩm Định Ngay
                </Text>
                <Text size="xl" fw={800} className="mt-1 text-amber-600">
                  {pendingEvidences.length} <span className="text-xs font-normal text-slate-500">hồ sơ</span>
                </Text>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <IconClock size={24} />
              </div>
            </div>
          </Card>

          <Card padding="lg" radius="lg" className="border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <Text size="xs" c="dimmed" fw={600} className="uppercase tracking-wider">
                  Đã Duyệt
                </Text>
                <Text size="xl" fw={800} className="mt-1 text-emerald-600">
                  {deptApprovedCount}
                </Text>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <IconCertificate size={24} />
              </div>
            </div>
          </Card>

          <Card padding="lg" radius="lg" className="border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <Text size="xs" c="dimmed" fw={600} className="uppercase tracking-wider">
                  Yêu Cầu Bổ Sung
                </Text>
                <Text size="xl" fw={800} className="mt-1 text-red-600">
                  {departmentEvidences.filter((e) => e.currentStatus === EvidenceStatusValues.NEEDS_SUPPLEMENT).length}
                </Text>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <IconAlertTriangle size={24} />
              </div>
            </div>
          </Card>

          <Card padding="lg" radius="lg" className="border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <Text size="xs" c="dimmed" fw={600} className="uppercase tracking-wider">
                  Số Giáo Viên Trong Tổ
                </Text>
                <Text size="xl" fw={800} className="mt-1 text-blue-900">
                  {displayTeachers.length} <span className="text-xs font-normal text-slate-500">thành viên</span>
                </Text>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <IconUsers size={24} />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Paper p="lg" radius="lg" className="border border-slate-200 bg-white shadow-sm space-y-4">
          <Tabs value={activeTab} onChange={(val) => setActiveTab(val || "pending")}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-2 gap-3">
              <Tabs.List>
                <Tabs.Tab
                  value="pending"
                  leftSection={<IconClock size={16} />}
                  rightSection={<Badge color="amber" size="xs">{pendingEvidences.length}</Badge>}
                  className="font-semibold text-sm"
                >
                  Minh Chứng Chờ Duyệt
                </Tabs.Tab>

                <Tabs.Tab
                  value="reviewed"
                  leftSection={<IconCertificate size={16} />}
                  className="font-semibold text-sm"
                >
                  Lịch Sử Thẩm Định
                </Tabs.Tab>

                <Tabs.Tab
                  value="teachers"
                  leftSection={<IconUsers size={16} />}
                  className="font-semibold text-sm"
                >
                  Tiến Độ Giáo Viên
                </Tabs.Tab>

                <Tabs.Tab
                  value="matrix"
                  leftSection={<IconTable size={16} />}
                  className="font-semibold text-sm text-blue-900"
                >
                  8 Tiêu Chuẩn & 35 Tiêu Chí
                </Tabs.Tab>

                <Tabs.Tab
                  value="contacts"
                  leftSection={<IconUsers size={16} />}
                  className="font-semibold text-sm text-teal-900"
                >
                  Danh Bạ Người Dùng
                </Tabs.Tab>
              </Tabs.List>

            </div>

            {/* Tab 1 & 2: Evidence Tables */}
            {(activeTab === "pending" || activeTab === "reviewed") && (
              <Tabs.Panel value={activeTab} className="pt-4">
                {activeTab === "pending" && (
                  <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <TextInput
                      placeholder="Tìm kiếm theo tên giáo viên hoặc email..."
                      size="sm"
                      radius="md"
                      leftSection={<IconSearch size={16} />}
                      value={pendingSearchQuery}
                      onChange={(e) => setPendingSearchQuery(e.currentTarget.value)}
                      className="w-full sm:w-96 bg-white"
                    />
                    <Text size="xs" fw={600} className="text-slate-600">
                      Hiển thị <span className="text-blue-600 fw-bold">{filteredPendingEvidences.length}</span> / {pendingEvidences.length} minh chứng chờ duyệt
                    </Text>
                  </div>
                )}
                {activeTab === "reviewed" && (
                  <div className="mb-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto flex-wrap">
                      <TextInput
                        placeholder="Tìm theo tên hoặc email..."
                        size="sm"
                        radius="md"
                        leftSection={<IconSearch size={16} />}
                        value={reviewedSearchQuery}
                        onChange={(e) => setReviewedSearchQuery(e.currentTarget.value)}
                        className="w-full sm:w-64 bg-white"
                      />
                      <Select
                        placeholder="Lọc theo trạng thái"
                        size="sm"
                        radius="md"
                        value={reviewedStatusFilter}
                        onChange={(val) => setReviewedStatusFilter(val || "ALL")}
                        data={[
                          { value: "ALL", label: "Tất cả trạng thái" },
                          { value: EvidenceStatusValues.APPROVED, label: "Đã duyệt (Approved)" },
                          { value: EvidenceStatusValues.REJECTED, label: "Từ chối (Rejected)" },
                          { value: EvidenceStatusValues.NEEDS_SUPPLEMENT, label: "Cần bổ sung (Needs Supplement)" }
                        ]}
                        className="w-full sm:w-48 bg-white"
                      />
                      <Select
                        placeholder="Khoảng thời gian"
                        size="sm"
                        radius="md"
                        value={reviewedDateRangeFilter}
                        onChange={(val) => setReviewedDateRangeFilter(val || "ALL")}
                        data={[
                          { value: "ALL", label: "Tất cả thời gian" },
                          { value: "7DAYS", label: "7 ngày qua" },
                          { value: "30DAYS", label: "30 ngày qua" },
                          { value: "90DAYS", label: "90 ngày qua" },
                          { value: "THIS_YEAR", label: "Năm nay" }
                        ]}
                        className="w-full sm:w-48 bg-white"
                      />
                    </div>
                    <Text size="xs" fw={600} className="text-slate-600 whitespace-nowrap">
                      Hiển thị <span className="text-blue-600 fw-bold">{filteredReviewedEvidences.length}</span> / {reviewedEvidences.length} lịch sử thẩm định
                    </Text>
                  </div>
                )}
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                    <Table.Thead className="bg-slate-50 text-slate-700">
                      <Table.Tr>
                        <Table.Th>Giáo Viên Nộp</Table.Th>
                        <Table.Th>Mã / Tên Minh Chứng</Table.Th>
                        <Table.Th>Tiêu Chuẩn & Tiêu Chí</Table.Th>
                        <Table.Th>Ngày Nộp</Table.Th>
                        <Table.Th>Trạng Thái</Table.Th>
                        <Table.Th className="text-right">Thẩm Định</Table.Th>
                      </Table.Tr>
                    </Table.Thead>

                    <Table.Tbody>
                      {filteredList.length === 0 ? (
                        <Table.Tr>
                          <Table.Td colSpan={6} className="text-center py-8 text-slate-500">
                            Không có minh chứng nào trong mục này.
                          </Table.Td>
                        </Table.Tr>
                      ) : (
                        filteredList.map((item) => (
                          <Table.Tr key={item.id}>
                            <Table.Td>
                              <div className="flex items-center space-x-2">
                                <Avatar color="blue" radius="xl" size="sm">
                                  {item.submittedBy.fullName.split(" ").slice(-1)[0][0]}
                                </Avatar>
                                <div>
                                  <Text size="xs" fw={700} className="text-slate-900">
                                    {item.submittedBy.fullName}
                                  </Text>
                                  <Text size="xs" c="dimmed">
                                    {item.submittedBy.email}
                                  </Text>
                                </div>
                              </div>
                            </Table.Td>

                            <Table.Td>
                              <div>
                                <Text size="xs" fw={700} className="text-blue-900 font-mono">
                                  {item.evidenceId}
                                </Text>
                                <Text size="sm" fw={600} className="text-slate-900 max-w-xs truncate">
                                  {item.title}
                                </Text>
                              </div>
                            </Table.Td>

                            <Table.Td>
                              <Text size="xs" fw={600} className="text-slate-800">
                                {item.standardName}
                              </Text>
                              <Text size="xs" className="text-slate-500">
                                {item.criteriaName}
                              </Text>
                            </Table.Td>

                            <Table.Td>
                              <Text size="xs" className="font-mono text-slate-600">
                                {item.date}
                              </Text>
                            </Table.Td>

                            <Table.Td>
                              {item.currentStatus === EvidenceStatusValues.APPROVED && (
                                <Badge color="emerald">Đã duyệt</Badge>
                              )}
                              {item.currentStatus === EvidenceStatusValues.PENDING && (
                                <Badge color="amber">Chờ duyệt</Badge>
                              )}
                              {item.currentStatus === EvidenceStatusValues.NEEDS_SUPPLEMENT && (
                                <Badge color="red">Yêu cầu bổ sung</Badge>
                              )}
                            </Table.Td>

                            <Table.Td className="text-right">
                              <Button
                                size="xs"
                                variant={item.currentStatus === EvidenceStatusValues.PENDING ? "filled" : "outline"}
                                color="blue"
                                leftSection={<IconEye size={14} />}
                                onClick={() => {
                                  setSelectedEvidence(item)
                                  setReviewComment(item.reviewComment || "")
                                  setActiveAttachmentIdx(0)
                                  setModalTab("details")
                                  setNewCommentText("")
                                }}
                              >
                                {item.currentStatus === EvidenceStatusValues.PENDING ? "Thẩm Định" : "Xem Lại"}
                              </Button>
                            </Table.Td>
                          </Table.Tr>
                        ))
                      )}
                    </Table.Tbody>
                  </Table>
                </div>
              </Tabs.Panel>
            )}

            {/* Tab 3: Teachers Overview */}
            <Tabs.Panel value="teachers" className="pt-4">
              <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <TextInput
                  placeholder="Tìm kiếm giáo viên theo tên hoặc email..."
                  size="sm"
                  radius="md"
                  leftSection={<IconSearch size={16} />}
                  value={teacherSearchQuery}
                  onChange={(e) => setTeacherSearchQuery(e.currentTarget.value)}
                  className="w-full sm:w-96 bg-white"
                />
                <Text size="xs" fw={600} className="text-slate-600 whitespace-nowrap">
                  Hiển thị <span className="text-blue-600 font-bold">{filteredDepartmentTeachers.length}</span> / {displayTeachers.length} giáo viên
                </Text>
              </div>

              {filteredDepartmentTeachers.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-lg border border-slate-200 text-slate-500">
                  Không tìm thấy giáo viên phù hợp với từ khóa "{teacherSearchQuery}".
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {filteredDepartmentTeachers.map((teacher: any, idx) => {
                    const teacherName = teacher.fullName || teacher.name || "Giáo viên"
                    const completion = teacher.completionPercentage ?? teacher.completionRate ?? 0
                    const initials = teacherName.split(" ").slice(-1)[0][0] || "GV"

                    return (
                      <Card key={idx} padding="lg" radius="md" className="border border-slate-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <Avatar color="blue" radius="xl" size="md">
                            {initials}
                          </Avatar>
                          <div>
                            <Text size="sm" fw={700} className="text-slate-900">{teacherName}</Text>
                            <Text size="xs" c="dimmed">{teacher.email}</Text>
                          </div>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span>Đã nộp:</span>
                            <span className="font-semibold">{teacher.totalSubmitted || 0} tệp</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Đã duyệt:</span>
                            <span className="font-semibold text-emerald-600">{teacher.approved || 0} tệp</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Chờ thẩm định:</span>
                            <span className="font-semibold text-amber-600">{teacher.pending || 0} tệp</span>
                          </div>
                          {teacher.needsSupplement > 0 && (
                            <div className="flex justify-between">
                              <span>Yêu cầu bổ sung:</span>
                              <span className="font-semibold text-red-600">{teacher.needsSupplement} tệp</span>
                            </div>
                          )}

                          <div className="pt-2">
                            <div className="flex justify-between mb-1">
                              <span className="font-semibold text-slate-700">Tiến độ tiêu chí:</span>
                              <span className="font-bold text-blue-900">{completion}%</span>
                            </div>
                            <Progress value={completion} color="emerald" radius="xl" />
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </Tabs.Panel>

            <Tabs.Panel value="matrix" className="pt-4 space-y-4">
              <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                  <Text fw={700} size="sm" className="text-slate-800">
                    Ma trận 8 Tiêu chuẩn & 35 Tiêu chí cá nhân của Tổ trưởng / Tổ phó
                  </Text>
                  <Text size="xs" c="dimmed">
                    Nộp và quản lý minh chứng cá nhân phục vụ đánh giá chuẩn nghề nghiệp.
                  </Text>
                </div>
                <Button
                  size="sm"
                  color="blue"
                  leftSection={<IconPlus size={16} />}
                  onClick={handleOpenAddModal}
                >
                  Nộp Minh Chứng Mới
                </Button>
              </div>

              <CriteriaMatrixTable
                evidences={headEvidences}
                onViewEvidence={(item) => {
                  setSelectedEvidence(item)
                  setModalTab("details")
                  setNewCommentText("")
                }}
                onAddForCriterion={(std, crit) => handleOpenAddModalForCriterion(std, crit)}
                onEditEvidence={(item) => handleEditEvidence(item)}
                onDeleteEvidence={(item) => handleDeleteEvidence(item)}
              />
            </Tabs.Panel>

            <Tabs.Panel value="contacts" className="pt-4">
              <UserContactsTab />
            </Tabs.Panel>
          </Tabs>
        </Paper>
      </main>

      {/* Review Modal */}
      {selectedEvidence && (
        <Modal
          opened={!!selectedEvidence}
          onClose={() => {
            setSelectedEvidence(null)
          }}
          title={
            <Group gap="xs">
              <IconCertificate size={20} className="text-blue-900" />
              <Text fw={700}>Thẩm Định Minh Chứng #{selectedEvidence.evidenceId}</Text>
            </Group>
          }
          radius="lg"
          size="xl"
          centered
        >
          {(() => {
            const attachmentsList = selectedEvidence.attachments && selectedEvidence.attachments.length > 0
              ? selectedEvidence.attachments
              : (selectedEvidence.urlFile && selectedEvidence.urlFile !== "#" ? [{
                  name: selectedEvidence.originalFileName || "Minh chứng",
                  url: selectedEvidence.urlFile,
                  format: selectedEvidence.fileFormat || "unknown",
                  size: selectedEvidence.fileSize || 0
                }] : []);

            const activeAttachment = attachmentsList[activeAttachmentIdx] || attachmentsList[0];
            
            const getExtension = (name: string, format: string) => {
              if (name) {
                const parts = name.split(".")
                if (parts.length > 1) {
                  const extension = parts.pop()?.toLowerCase() || ""
                  if (extension) return extension
                }
              }
              const rawFormat = format ? format.toLowerCase() : ""
              if (rawFormat.includes("/")) {
                const subType = rawFormat.split("/")[1]
                if (subType.includes("word") || subType.includes("document")) return "docx"
                if (subType.includes("sheet") || subType.includes("excel") || subType === "xlsx" || subType === "xls") return "xlsx"
                if (subType.includes("presentation") || subType.includes("powerpoint") || subType === "pptx" || subType === "ppt") return "pptx"
                return subType
              }
              return rawFormat.replace(/^\./, "")
            }

            const ext = activeAttachment ? getExtension(activeAttachment.name, activeAttachment.format) : "";
            const isUrl = activeAttachment ? (activeAttachment.format?.toLowerCase() === "url" || activeAttachment.format?.toLowerCase() === "link" || activeAttachment.url?.startsWith("http") && !activeAttachment.url?.includes("simulated") && !activeAttachment.url?.includes("r2.dev") && !activeAttachment.url?.includes("example.com")) : false;

            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT COLUMN: Metadata and Review inputs with Comments Tab */}
                <div className="lg:col-span-5 flex flex-col h-[520px]">
                  <Tabs value={modalTab} onChange={(val) => setModalTab(val || "details")} className="flex flex-col flex-1">
                    <Tabs.List className="mb-3">
                      <Tabs.Tab value="details" leftSection={<IconFileText size={14} />}>
                        Thẩm Định
                      </Tabs.Tab>
                      <Tabs.Tab 
                        value="chat" 
                        leftSection={<IconMessage size={14} />}
                        rightSection={
                          selectedEvidence.comments && selectedEvidence.comments.length > 0 ? (
                            <Badge size="xs" variant="filled" color="red" circle>
                              {selectedEvidence.comments.length}
                            </Badge>
                          ) : null
                        }
                      >
                        Trao Đổi
                      </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="details" className="flex flex-col justify-between flex-1 overflow-y-auto pr-1 space-y-4">
                      <div className="space-y-4">
                        <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 text-xs space-y-1">
                          <p><strong>Giáo viên nộp:</strong> {selectedEvidence.submittedBy.fullName} ({selectedEvidence.submittedBy.email})</p>
                          <p><strong>Tiêu chuẩn:</strong> {selectedEvidence.standardName}</p>
                          <p><strong>Tiêu chí:</strong> {selectedEvidence.criteriaName}</p>
                        </div>

                        <div>
                          <Text size="xs" fw={600} className="mb-1 text-slate-800">
                            Tên minh chứng:
                          </Text>
                          <Text size="sm" className="p-2.5 bg-white border border-slate-200 rounded-md fw-semibold text-slate-900">
                            {selectedEvidence.title}
                          </Text>
                        </div>

                        {selectedEvidence.description && (
                          <div>
                            <Text size="xs" fw={600} className="mb-1 text-slate-800">
                              Mô tả chi tiết:
                            </Text>
                            <Text size="sm" className="p-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 whitespace-pre-line max-h-[100px] overflow-y-auto">
                              {selectedEvidence.description}
                            </Text>
                          </div>
                        )}

                        {/* ATTACHMENTS SELECTOR LIST */}
                        <div className="space-y-2">
                          <Text fw={700} size="xs" className="text-blue-950">
                            Danh sách tệp tin / liên kết ({attachmentsList.length}):
                          </Text>
                          <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
                            {attachmentsList.map((att, idx) => {
                              const attIsUrl = att.format?.toLowerCase() === "url" || att.format?.toLowerCase() === "link";
                              const isActive = idx === activeAttachmentIdx;
                              return (
                                <div
                                  key={idx}
                                  onClick={() => setActiveAttachmentIdx(idx)}
                                  className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all ${
                                    isActive
                                      ? "border-blue-500 bg-blue-50/70 shadow-sm"
                                      : "border-slate-100 bg-slate-50/50 hover:bg-slate-100/50"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    {attIsUrl ? (
                                      <IconLink size={14} className="text-blue-600 shrink-0" />
                                    ) : (
                                      <IconFileText size={14} className="text-teal-600 shrink-0" />
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <Text size="xs" fw={600} className="text-slate-800 truncate" title={att.name}>
                                        {att.name}
                                      </Text>
                                      <Text size="10px" c="dimmed">
                                        {attIsUrl ? "Liên kết" : att.size > 0 ? `${(att.size / (1024 * 1024)).toFixed(2)}MB` : "File"}
                                      </Text>
                                    </div>
                                  </div>
                                  <div className="flex gap-1 shrink-0 ml-1">
                                    <Button
                                      size="xs"
                                      variant="subtle"
                                      color="blue"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(att.url, "_blank");
                                      }}
                                      className="h-7 px-1.5"
                                    >
                                      <IconExternalLink size={12} />
                                    </Button>
                                    {!attIsUrl && (
                                      <Button
                                        size="xs"
                                        variant="subtle"
                                        color="teal"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDownload(att.url, att.name);
                                        }}
                                        className="h-7 px-1.5"
                                      >
                                        <IconDownload size={12} />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 pt-2 border-t border-slate-100 shrink-0">
                        <Textarea
                          label={`Nhận xét & Đánh giá của ${roleTitle}`}
                          placeholder="Nhập nội dung nhận xét hoặc chỉ dẫn nếu yêu cầu bổ sung..."
                          rows={2}
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.currentTarget.value)}
                        />

                        <div className="flex justify-end space-x-2">
                          <Button
                            color="red"
                            variant="light"
                            size="xs"
                            leftSection={<IconAlertTriangle size={14} />}
                            loading={isSubmittingReview}
                            onClick={() => {
                              handleRequestSupplement(selectedEvidence)
                            }}
                          >
                            Yêu Cầu Bổ Sung
                          </Button>
                          <Button
                            color="emerald"
                            size="xs"
                            leftSection={<IconCheck size={14} />}
                            loading={isSubmittingReview}
                            onClick={() => {
                              handleApprove(selectedEvidence)
                            }}
                          >
                            Phê Duyệt
                          </Button>
                        </div>
                      </div>
                    </Tabs.Panel>

                    <Tabs.Panel value="chat" className="flex flex-col justify-between flex-1 h-full overflow-hidden">
                      {/* GitHub style Timeline comments */}
                      <div className="flex-1 overflow-y-auto pr-1 space-y-4 py-2 min-h-[300px]">
                        {(!selectedEvidence.comments || selectedEvidence.comments.length === 0) ? (
                          <div className="text-center py-8 text-slate-400">
                            <IconMessage size={36} className="mx-auto stroke-[1.2] mb-2 text-slate-300 animate-pulse" />
                            <Text size="xs">Chưa có trao đổi nào cho minh chứng này.</Text>
                            <Text size="10px" c="dimmed" className="mt-1">Tổ trưởng có thể đặt câu hỏi hoặc yêu cầu chỉnh sửa, giáo viên có thể trả lời tại đây.</Text>
                          </div>
                        ) : (
                          <div className="relative pl-4 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                            {selectedEvidence.comments.map((cmt, idx) => {
                              const isMe = cmt.userId === currentUser.userId;
                              const isDeptHead = cmt.userRole === "DepartmentHead";
                              const isSchoolBoard = cmt.userRole === "SchoolBoard";
                              
                              let roleName = "Giáo viên";
                              let roleColor = "blue";
                              if (isDeptHead) {
                                roleName = "Tổ trưởng";
                                roleColor = "violet";
                              } else if (isSchoolBoard) {
                                roleName = "Ban giám hiệu";
                                roleColor = "red";
                              }

                              const commentTime = new Date(cmt.createdAt).getTime();
                              const canRecall = isMe && (nowTime - commentTime < 60 * 60 * 1000);

                              return (
                                <div key={idx} className="relative">
                                  {/* Bullet point on the timeline line */}
                                  <div className={`absolute -left-[19px] top-1.5 w-2.5 h-2.5 rounded-full border-2 ${
                                    isMe ? "bg-blue-600 border-blue-200" : "bg-slate-400 border-white"
                                  }`} />
                                  
                                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                                    {/* Comment Header - Like GitHub */}
                                    <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex justify-between items-center text-xs">
                                      <div className="flex items-center gap-1.5">
                                        <Avatar size="xs" radius="xl" color={isMe ? "blue" : "gray"}>
                                          {cmt.userName.slice(0, 1).toUpperCase()}
                                        </Avatar>
                                        <Text fw={700} size="xs" className="text-slate-800">{cmt.userName}</Text>
                                        <Badge size="xs" variant="light" color={roleColor}>
                                          {roleName}
                                        </Badge>
                                        {isMe && <Badge size="xs" variant="outline" color="gray">Bạn</Badge>}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Text size="10px" c="dimmed">
                                          {new Date(cmt.createdAt).toLocaleString("vi-VN", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit"
                                          })}
                                        </Text>
                                        {canRecall && cmt.id && (
                                          <Button
                                            size="compact-xs"
                                            variant="subtle"
                                            color="red"
                                            className="h-5 px-1.5 min-w-0"
                                            onClick={() => handleRecallComment(cmt.id!)}
                                            title="Thu hồi phản hồi này"
                                          >
                                            Thu hồi
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                    {/* Comment Body */}
                                    <div className="p-3 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                                      {cmt.content}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Reply Input block */}
                      <div className="pt-2 border-t border-slate-100 shrink-0 space-y-2 bg-white">
                        <Textarea
                          placeholder="Nhập câu hỏi, giải trình hoặc phản hồi... (Ấn Enter để gửi)"
                          rows={2}
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.currentTarget.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              if (e.nativeEvent.isComposing) {
                                return
                              }
                              e.preventDefault()
                              handleAddComment()
                            }
                          }}
                          disabled={isSubmittingComment}
                          styles={{
                            input: { fontSize: "12px" }
                          }}
                        />
                        <div className="flex justify-end">
                          <Button
                            size="xs"
                            color="blue"
                            leftSection={<IconSend size={12} />}
                            loading={isSubmittingComment}
                            disabled={!newCommentText.trim()}
                            onClick={handleAddComment}
                          >
                            Gửi Phản Hồi
                          </Button>
                        </div>
                      </div>
                    </Tabs.Panel>
                  </Tabs>
                </div>

                {/* RIGHT COLUMN: Automatic Preview Panel */}
                <div className="lg:col-span-7 border-l border-slate-100 lg:pl-6 flex flex-col gap-3 h-[520px]">
                  <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {isUrl ? (
                        <IconLink size={16} className="text-blue-600 shrink-0" />
                      ) : (
                        <IconFileText size={16} className="text-teal-600 shrink-0" />
                      )}
                      <Text size="xs" fw={700} className="text-slate-800 truncate" title={activeAttachment?.name}>
                        Xem trước: {activeAttachment?.name || "Không có tệp"}
                      </Text>
                    </div>
                    {activeAttachment?.url && activeAttachment.url !== "#" && (
                      <Button
                        size="xs"
                        variant="light"
                        color="blue"
                        component="a"
                        href={activeAttachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        leftSection={<IconExternalLink size={12} />}
                      >
                        Mở tab mới
                      </Button>
                    )}
                  </div>

                  <div className="flex-1 overflow-hidden flex justify-center bg-slate-50 rounded-xl border border-slate-200 p-2 min-h-[300px]">
                    {(() => {
                      if (!activeAttachment || !activeAttachment.url || activeAttachment.url === "#") {
                        return (
                          <div className="text-center my-auto p-4 space-y-2">
                            <IconFileText size={40} className="text-slate-300 mx-auto" />
                            <Text size="xs" c="dimmed">Không tìm thấy đường dẫn tệp tin thực tế.</Text>
                          </div>
                        );
                      }

                      if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) {
                        return (
                          <div className="w-full h-full flex items-center justify-center p-2 bg-white rounded-lg border border-slate-100 overflow-auto">
                            <img
                              src={activeAttachment.url}
                              alt={activeAttachment.name}
                              className="max-h-[380px] object-contain rounded"
                            />
                          </div>
                        );
                      } else if (ext === "pdf") {
                        return (
                          <iframe
                            src={activeAttachment.url}
                            title={activeAttachment.name}
                            className="w-full h-full border-0 rounded-lg bg-white"
                          />
                        );
                      } else if (["docx", "doc", "xlsx", "xls", "pptx", "ppt"].includes(ext)) {
                        return (
                          <div className="w-full h-full flex flex-col gap-2">
                            <iframe
                              src={`https://docs.google.com/gview?url=${encodeURIComponent(activeAttachment.url)}&embedded=true`}
                              title={activeAttachment.name}
                              className="w-full flex-1 border-0 rounded-lg bg-white"
                            />
                            <Text size="10px" c="dimmed" className="text-center">
                              Xem trước qua Office Viewer. Nhấn "Mở tab mới" nếu không hiển thị.
                            </Text>
                          </div>
                        );
                      } else if (isUrl) {
                        return (
                          <div className="w-full h-full flex flex-col justify-between p-4 bg-white rounded-lg border border-slate-100 space-y-4">
                            <div className="space-y-2 text-center my-auto">
                              <IconLink size={36} className="text-blue-500 mx-auto" />
                              <Text fw={700} size="sm" className="text-slate-800">
                                Đường liên kết trực tuyến
                              </Text>
                              <Text size="xs" c="dimmed" className="max-w-md mx-auto">
                                Một số dịch vụ lưu trữ (Google Drive, Dropbox) chặn xem trước trực tiếp qua iframe bảo mật. Hãy nhấp nút bên dưới để xem trực tiếp liên kết.
                              </Text>
                              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md font-mono text-xs text-blue-700 break-all text-center select-all max-w-sm mx-auto">
                                {activeAttachment.url}
                              </div>
                              <Button
                                component="a"
                                href={activeAttachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="sm"
                                color="blue"
                                className="mt-2"
                                leftSection={<IconExternalLink size={14} />}
                              >
                                Truy cập liên kết ngoài
                              </Button>
                            </div>
                            {/* Embedded Frame preview try-out anyway */}
                            <div className="border border-slate-150 rounded-lg overflow-hidden h-[150px] bg-slate-50">
                              <iframe
                                src={activeAttachment.url}
                                title={activeAttachment.name}
                                className="w-full h-full border-0"
                              />
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div className="text-center my-auto p-4 space-y-2">
                            <IconFileText size={40} className="text-slate-400 mx-auto" />
                            <Text size="xs" c="dimmed">Không hỗ trợ xem trước trực tiếp định dạng này ({ext.toUpperCase()}).</Text>
                            <Button
                              size="xs"
                              variant="light"
                              color="blue"
                              onClick={() => window.open(activeAttachment.url, "_blank")}
                              leftSection={<IconExternalLink size={12} />}
                            >
                              Mở bằng trình duyệt
                            </Button>
                          </div>
                        );
                      }
                    })()}
                  </div>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* Modal: Nộp Minh Chứng Mới / Chỉnh Sửa */}
      <Modal
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false)
          setEditingEvidence(null)
          setNotificationMessage(null)
          if (notificationTimeoutId) {
            clearTimeout(notificationTimeoutId)
          }
        }}
        title={
          <Group gap="xs">
            <IconFileUpload className="text-blue-900" size={20} />
            <Text fw={700}>
              {editingEvidence ? "Chỉnh Sửa / Bổ Sung Minh Chứng" : "Nộp Minh Chứng Sư Phạm Mới"}
            </Text>
          </Group>
        }
        radius="lg"
        size="lg"
        centered
      >
        {notificationMessage && (
          <Alert 
            color="red" 
            title="Lưu ý quan trọng" 
            icon={<IconAlertTriangle size={16} />} 
            className="mb-4"
            styles={{
              title: { fontWeight: 700 }
            }}
          >
            {notificationMessage}
          </Alert>
        )}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <TextInput
            label="Tên minh chứng"
            placeholder="Ví dụ: Quyết định bồi dưỡng chuyên môn năm 2026"
            required
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
          />

          <Select
            label="Thuộc Tiêu chuẩn"
            data={standardOptions}
            value={standardName}
            disabled={editingEvidence?.currentStatus === EvidenceStatusValues.NEEDS_SUPPLEMENT}
            onChange={(val) => {
              if (val) {
                const fObj = fields.find((f) => f.fieldName === val)
                if (!editingEvidence && fObj && isStandardBlocked(fObj)) {
                  setNotificationMessage("Tất cả các tiêu chí thuộc Tiêu chuẩn này đã được duyệt, đang chờ duyệt hoặc yêu cầu bổ sung. Vui lòng chọn Tiêu chuẩn khác!")
                  if (notificationTimeoutId) {
                    clearTimeout(notificationTimeoutId)
                  }
                  const timeoutId = setTimeout(() => {
                    setNotificationMessage(null)
                  }, 4000)
                  setNotificationTimeoutId(timeoutId)
                  return
                }
                setStandardName(val)
                if (fObj && fObj.criteria && fObj.criteria.length > 0) {
                  const firstUnblocked = fObj.criteria.find(c => getCriterionSelectableStatus(c).selectable)
                  if (firstUnblocked) {
                    setCriteriaName(firstUnblocked.criteriaName)
                  } else {
                    setCriteriaName(fObj.criteria[0].criteriaName)
                  }
                }
              }
            }}
          />

          <Select
            label="Thuộc Tiêu chí cụ thể"
            data={criteriaOptions}
            value={criteriaName}
            disabled={editingEvidence?.currentStatus === EvidenceStatusValues.NEEDS_SUPPLEMENT}
            onChange={(val) => {
              if (val) {
                if (!editingEvidence && isCriterionBlocked(val)) {
                  let statusText = "đã được duyệt hoặc đang chờ duyệt"
                  for (const f of fields) {
                    if (!f.criteria) continue
                    const c = f.criteria.find((crit) => crit.criteriaName === val || val.includes(crit.criteriaId))
                    if (c) {
                      const res = getCriterionBlockedStatus(c)
                      if (res.statusText) statusText = res.statusText
                    }
                  }
                  setNotificationMessage(`Tiêu chí này ${statusText}. Vui lòng không nộp thêm minh chứng cho tiêu chí này!`)
                  if (notificationTimeoutId) {
                    clearTimeout(notificationTimeoutId)
                  }
                  const timeoutId = setTimeout(() => {
                    setNotificationMessage(null)
                  }, 4000)
                  setNotificationTimeoutId(timeoutId)
                  return
                }
                setCriteriaName(val)
              }
            }}
          />

          {/* DANH SÁCH FILE & LINK MIXED UPLOAD */}
          <div className="space-y-4">
            {/* FILE UPLOAD SECTION */}
            <div className="space-y-2 p-3.5 border border-slate-100 rounded-xl bg-slate-50/50">
              <FileInput
                label="Tải tệp tin & Hình ảnh minh chứng"
                placeholder="Chọn một hoặc nhiều tệp tin, hình ảnh (tối đa 5MB)..."
                clearable
                multiple
                leftSection={<IconFileUpload size={16} />}
                value={selectedFiles}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt,image/*"
                error={fileError}
              />
              {selectedFiles && selectedFiles.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  <Text size="xs" fw={700} className="text-slate-700">Tệp mới đã chọn ({selectedFiles.length}):</Text>
                  {selectedFiles.map((f, i) => (
                    <div key={i} className="flex justify-between items-center bg-white border border-slate-100 rounded-lg p-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <IconFileText size={14} className="text-teal-600 shrink-0" />
                        <Text size="xs" className="text-slate-700 truncate" title={f.name}>{f.name}</Text>
                        <Text size="10px" c="dimmed">({(f.size / (1024 * 1024)).toFixed(2)}MB)</Text>
                      </div>
                      <ActionIcon size="xs" color="red" variant="subtle" onClick={() => removeSelectedFile(i)}>
                        <IconTrash size={12} />
                      </ActionIcon>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* LINKS SECTION */}
            <div className="space-y-2 p-3.5 border border-slate-100 rounded-xl bg-slate-50/50">
              <div className="flex gap-2 items-end">
                <TextInput
                  label="Thêm đường liên kết minh chứng (URL)"
                  placeholder="Dán link Drive, Dropbox, video, trang web..."
                  leftSection={<IconLink size={16} />}
                  value={currentLink}
                  onChange={(e) => {
                    setCurrentLink(e.target.value)
                    setFileError(null)
                  }}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addLinkToList()
                    }
                  }}
                />
                <Button size="sm" color="blue" onClick={addLinkToList} variant="light">
                  Thêm link
                </Button>
              </div>

              {evidenceLinks.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  <Text size="xs" fw={700} className="text-slate-700">Liên kết mới đã thêm ({evidenceLinks.length}):</Text>
                  {evidenceLinks.map((link, i) => (
                    <div key={i} className="flex justify-between items-center bg-white border border-slate-100 rounded-lg p-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <IconLink size={14} className="text-blue-600 shrink-0" />
                        <Text size="xs" className="text-slate-700 truncate" title={link}>{link}</Text>
                      </div>
                      <ActionIcon size="xs" color="red" variant="subtle" onClick={() => removeLinkFromList(i)}>
                        <IconTrash size={12} />
                      </ActionIcon>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* EXISTING ATTACHMENTS (FOR EDITING) */}
            {editingEvidence && existingAttachments.length > 0 && (
              <div className="space-y-2 p-3.5 border border-amber-200 rounded-xl bg-amber-50/10">
                <div className="flex items-center gap-1.5 pb-1 border-b border-amber-100">
                  <IconArchive size={16} className="text-amber-700" />
                  <Text fw={700} size="xs" className="text-amber-950">
                    Tài liệu hiện tại của minh chứng ({existingAttachments.length}):
                  </Text>
                </div>
                
                <div className="space-y-1.5">
                  {existingAttachments.map((att, i) => {
                    const isUrl = att.format?.toLowerCase() === "url" || att.format?.toLowerCase() === "link";
                    return (
                      <div key={i} className="flex justify-between items-center bg-white/80 border border-amber-100 rounded-lg p-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {isUrl ? (
                            <IconLink size={14} className="text-blue-600 shrink-0" />
                          ) : (
                            <IconFileText size={14} className="text-teal-600 shrink-0" />
                          )}
                          <Text size="xs" className="text-slate-700 truncate" title={att.name}>{att.name}</Text>
                          {!isUrl && att.size > 0 && (
                            <Text size="10px" c="dimmed">({(att.size / (1024 * 1024)).toFixed(2)}MB)</Text>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <ActionIcon size="xs" color="blue" variant="subtle" onClick={() => window.open(att.url, "_blank")}>
                            <IconEye size={12} />
                          </ActionIcon>
                          <ActionIcon size="xs" color="red" variant="subtle" onClick={() => removeExistingAttachment(i)} title="Xóa tài liệu này">
                            <IconTrash size={12} />
                          </ActionIcon>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <Textarea
            label="Mô tả chi tiết / Ghi chú (tùy chọn)"
            placeholder="Nhập mô tả chi tiết về nội dung minh chứng..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setModalOpened(false)}>
              Hủy bỏ
            </Button>
            <Button type="submit" color="blue">
              {editingEvidence ? "Lưu thay đổi" : "Gửi minh chứng"}
            </Button>
          </Group>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        title={<Text fw={700} c="red">Xác nhận xóa minh chứng</Text>}
        centered
        radius="lg"
      >
        <div className="space-y-4">
          <Text size="sm" className="text-slate-600">
            Bạn có chắc chắn muốn xóa minh chứng <span className="font-semibold text-slate-800">"{evidenceToDelete?.title}"</span> không? Hành động này sẽ xóa vĩnh viễn tệp trên hệ thống lưu trữ R2.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeleteModalOpened(false)} disabled={isDeleting}>
              Hủy
            </Button>
            <Button color="red" onClick={confirmDeleteEvidence} loading={isDeleting}>
              Xác nhận xóa
            </Button>
          </Group>
        </div>
      </Modal>
    </div>
  )
}
