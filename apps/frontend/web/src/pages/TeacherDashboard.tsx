import { useState, useEffect, useCallback, type FormEvent } from "react"
import {
  Title,
  Text,
  Button,
  Paper,
  Badge,
  Table,
  Group,
  TextInput,
  Select,
  Textarea,
  Modal,
  FileInput,
  Progress,
  ActionIcon,
  Tooltip,
  Card,
  Alert,
  Tabs,
  Pagination
} from "@mantine/core"
import {
  IconFileUpload,
  IconCheck,
  IconClock,
  IconAlertTriangle,
  IconSearch,
  IconFilter,
  IconFileText,
  IconEye,
  IconPlus,
  IconCircleCheck,
  IconSchool,
  IconAward,
  IconBook,
  IconListDetails,
  IconTable,
  IconRefresh,
  IconSparkles
} from "@tabler/icons-react"
import type { User, EvidenceItem, EvidenceStatus } from "../types/auth"
import { EvidenceStatus as EvidenceStatusValues } from "../types/auth"
import AppHeader from "../components/AppHeader"
import CriteriaMatrixTable from "../components/CriteriaMatrixTable"
import { getTeacherSummaryApi, getFieldsAndCriteria, type TeacherSummaryData, type PaginationInfo, type FieldItem } from "../services/evidenceApi"

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

interface TeacherDashboardProps {
  currentUser: User
  evidences: EvidenceItem[]
  onAddEvidence: (_newEvidence: Omit<EvidenceItem, "id" | "evidenceId" | "submittedBy">) => void
  onLogout: () => void
}

export default function TeacherDashboard({
  currentUser,
  evidences,
  onAddEvidence,
  onLogout
}: TeacherDashboardProps) {
  const [modalOpened, setModalOpened] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null)

  // API Backend states with Pagination
  const [loadingApi, setLoadingApi] = useState(true)
  const [apiSummary, setApiSummary] = useState<TeacherSummaryData | null>(null)
  const [apiEvidences, setApiEvidences] = useState<EvidenceItem[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  })

  // Form states for adding new evidence
  const [fields, setFields] = useState<FieldItem[]>(FRONTEND_FALLBACK_FIELDS)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [standardName, setStandardName] = useState("NĂNG LỰC SỬ DỤNG CÔNG NGHỆ SỐ")
  const [criteriaName, setCriteriaName] = useState("Vận hành thiết bị số phục vụ công việc chuyên môn")
  const [selectedFiles, setSelectedFiles] = useState<File[] | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

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
  const loadSummaryData = useCallback(async (targetPage = currentPage, targetSearch = searchQuery, targetStatus = statusFilter) => {
    setLoadingApi(true)
    const res = await getTeacherSummaryApi({
      page: targetPage,
      limit: pageSize,
      search: targetSearch,
      status: targetStatus
    })
    if (res && res.success) {
      setApiSummary(res.summary)
      setApiEvidences(res.evidences)
      if (res.pagination) {
        setPaginationInfo(res.pagination)
      }
    }
    setLoadingApi(false)
  }, [currentPage, pageSize, searchQuery, statusFilter])

  useEffect(() => {
    let isSubscribed = true
    getTeacherSummaryApi({
      page: currentPage,
      limit: pageSize,
      search: searchQuery,
      status: statusFilter
    }).then((res) => {
      if (isSubscribed) {
        if (res && res.success) {
          setApiSummary(res.summary)
          setApiEvidences(res.evidences)
          if (res.pagination) {
            setPaginationInfo(res.pagination)
          }
        }
        setLoadingApi(false)
      }
    })
    return () => {
      isSubscribed = false
    }
  }, [currentPage, pageSize, searchQuery, statusFilter, evidences])

  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    setCurrentPage(1)
  }

  const handleStatusChange = (val: string) => {
    setStatusFilter(val)
    setCurrentPage(1)
  }

  const fallbackTeacherEvidences = evidences.filter(
    (e) => e.submittedBy.userId === currentUser.userId || e.submittedBy.email === currentUser.email
  )

  const fallbackFiltered = fallbackTeacherEvidences.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.standardName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.criteriaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.evidenceId.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || item.currentStatus === statusFilter

    return matchesSearch && matchesStatus
  })

  const displayEvidences = apiEvidences.length > 0
    ? apiEvidences
    : fallbackFiltered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const totalItemCount = paginationInfo.total > 0 ? paginationInfo.total : fallbackFiltered.length
  const totalPageCount = paginationInfo.totalPages > 0 ? paginationInfo.totalPages : Math.ceil(fallbackFiltered.length / pageSize) || 1

  const totalCount = apiSummary ? apiSummary.totalSubmitted : fallbackTeacherEvidences.length
  const approvedCount = apiSummary ? apiSummary.approvedCount : fallbackTeacherEvidences.filter((e) => e.currentStatus === EvidenceStatusValues.APPROVED).length
  const pendingCount = apiSummary ? apiSummary.pendingCount : fallbackTeacherEvidences.filter((e) => e.currentStatus === EvidenceStatusValues.PENDING).length
  const totalCriteriaCount = apiSummary ? apiSummary.totalCriteriaCount : 35
  const completionPercentage = apiSummary ? apiSummary.completionPercentage : Math.round((approvedCount / totalCriteriaCount) * 100)
  const completedCriteriaCount = apiSummary ? apiSummary.completedCriteriaCount : approvedCount

  const standardOptions = fields.map((f) => ({
    value: f.fieldName,
    label: `Tiêu chuẩn ${f.fieldCode}: ${f.fieldName}`
  }))

  const selectedFieldObj = fields.find((f) => f.fieldName === standardName) || fields[0]
  const criteriaOptions = selectedFieldObj
    ? selectedFieldObj.criteria.map((c) => ({
      value: c.criteriaName,
      label: `${c.criteriaId}: ${c.criteriaName}`
    }))
    : []

  const handleFileChange = (files: File[] | File | null) => {
    setFileError(null)
    const fileList = Array.isArray(files) ? files : files ? [files] : []
    if (fileList.length === 0) {
      setSelectedFiles(null)
      return
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp"
    ]

    for (const f of fileList) {
      const ext = f.name.split(".").pop()?.toLowerCase()
      const isAllowedExt = ["pdf", "doc", "docx", "txt", "jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")
      if (!allowedTypes.includes(f.type) && !isAllowedExt) {
        setFileError(`Tệp "${f.name}" không đúng định dạng cho phép (PDF, DOCX, JPG, PNG, TXT).`)
        return
      }
    }

    const totalSize = fileList.reduce((acc, f) => acc + f.size, 0)
    const maxBytes = 5 * 1024 * 1024 // 5MB
    if (totalSize > maxBytes) {
      setFileError(`Tổng kích thước các tệp (${(totalSize / (1024 * 1024)).toFixed(2)}MB) vượt quá giới hạn 5MB.`)
      return
    }

    setSelectedFiles(fileList)
  }

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title || !selectedFiles || selectedFiles.length === 0 || fileError) {
      return
    }

    const originalFileName = selectedFiles.map((f) => f.name).join(", ")
    const totalFileSize = selectedFiles.reduce((acc, f) => acc + f.size, 0)
    const fileFormat = selectedFiles[0].type || "application/pdf"

    await onAddEvidence({
      title,
      description,
      date: new Date().toISOString().split("T")[0],
      originalFileName,
      fileFormat,
      fileSize: totalFileSize,
      urlFile: "#",
      currentStatus: EvidenceStatusValues.PENDING,
      standardName,
      criteriaName
    })

    // Reset form and reload API stats (reset page to 1 to show newly submitted evidence)
    setTitle("")
    setDescription("")
    setSelectedFiles(null)
    setFileError(null)
    setModalOpened(false)
    setCurrentPage(1)
    await loadSummaryData(1, searchQuery, statusFilter)
  }

  const getStatusBadge = (status: EvidenceStatus) => {
    switch (status) {
    case EvidenceStatusValues.APPROVED:
      return <Badge color="emerald" leftSection={<IconCheck size={12} />}>Đã duyệt</Badge>
    case EvidenceStatusValues.PENDING:
      return <Badge color="amber" leftSection={<IconClock size={12} />}>Chờ thẩm định</Badge>
    case EvidenceStatusValues.NEEDS_SUPPLEMENT:
      return <Badge color="red" leftSection={<IconAlertTriangle size={12} />}>Cần bổ sung</Badge>
    default:
      return <Badge color="gray">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-12">
      <AppHeader currentUser={currentUser} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Banner Welcome Card */}
        <Paper className="p-6 sm:p-8 bg-brand-gradient text-white shadow-lg rounded-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center space-x-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200 border border-blue-400/30">
                <IconSchool size={14} />
                <span>Cổng Giáo Viên THPT • Năm Học 2025 - 2026</span>
              </div>
              <Title order={2} className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Xin chào, {currentUser.fullName}!
              </Title>
              <Text size="sm" className="text-slate-300">
                Chuyên môn: <span className="font-semibold text-white">{currentUser.major}</span> | Tổ chuyên môn: <span className="font-semibold text-white">{currentUser.departmentName}</span>
              </Text>
            </div>

            <Button
              size="md"
              color="emerald"
              radius="md"
              leftSection={<IconPlus size={18} />}
              onClick={() => setModalOpened(true)}
              className="shadow-lg hover:shadow-xl shrink-0"
            >
              Nộp Minh Chứng Mới
            </Button>
          </div>
        </Paper>

        {/* API Status & Refresh Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-900">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <IconSparkles size={16} className="text-blue-600" />
            <span>Thống kê & Minh chứng được tải từ Backend API (/api/evidences/my-summary)</span>
          </div>

          <Button
            size="xs"
            variant="light"
            color="blue"
            leftSection={<IconRefresh size={14} />}
            onClick={() => loadSummaryData()}
            loading={loadingApi}
          >
            Làm mới từ Backend
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card padding="lg" radius="lg" className="border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <Text size="xs" c="dimmed" fw={600} className="uppercase tracking-wider">
                  Tổng Minh Chứng Đã Nộp
                </Text>
                <Text size="xl" fw={800} className="mt-1 text-slate-900">
                  {totalCount} <span className="text-xs font-normal text-slate-500">hồ sơ</span>
                </Text>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <IconFileText size={24} />
              </div>
            </div>
          </Card>

          <Card padding="lg" radius="lg" className="border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <Text size="xs" c="dimmed" fw={600} className="uppercase tracking-wider">
                  Đã Phê Duyệt
                </Text>
                <Text size="xl" fw={800} className="mt-1 text-emerald-600">
                  {approvedCount} <span className="text-xs font-normal text-slate-500">minh chứng</span>
                </Text>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <IconCircleCheck size={24} />
              </div>
            </div>
          </Card>

          <Card padding="lg" radius="lg" className="border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <Text size="xs" c="dimmed" fw={600} className="uppercase tracking-wider">
                  Đang Chờ Thẩm Định
                </Text>
                <Text size="xl" fw={800} className="mt-1 text-amber-600">
                  {pendingCount} <span className="text-xs font-normal text-slate-500">minh chứng</span>
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
                  Tiến Độ Hoàn Thành Tiêu Chí
                </Text>
                <Text size="xl" fw={800} className="mt-1 text-blue-900">
                  {completionPercentage}% <span className="text-xs font-normal text-slate-500">({completedCriteriaCount}/{totalCriteriaCount} tiêu chí)</span>
                </Text>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <IconAward size={24} />
              </div>
            </div>
            <Progress value={completionPercentage} color="blue" size="sm" radius="xl" className="mt-3" />
          </Card>
        </div>

        {/* Navigation Tabs for Views */}
        <Tabs defaultValue="evidences" variant="outline" radius="md">
          <Tabs.List className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm mb-4">
            <Tabs.Tab value="evidences" leftSection={<IconListDetails size={16} />} className="font-bold">
              Danh Sách Minh Chứng
            </Tabs.Tab>
            <Tabs.Tab value="matrix" leftSection={<IconTable size={16} />} className="font-bold text-blue-900">
              8 Tiêu Chuẩn & 35 Tiêu Chí (Khung Đánh Giá)
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="evidences">
            {/* Evidence Table Section */}
            <Paper p="lg" radius="lg" className="border border-slate-200 bg-white shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <Title order={3} className="text-lg font-bold text-slate-900">
                    Danh Sách Minh Chứng Sư Phạm
                  </Title>
                  <Text size="xs" c="dimmed">
                    Quản lý các tệp minh chứng đã đính kèm theo Tiêu chuẩn đánh giá giáo viên THPT.
                  </Text>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-3">
                  <TextInput
                    placeholder="Tìm kiếm minh chứng..."
                    size="xs"
                    radius="md"
                    leftSection={<IconSearch size={14} />}
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.currentTarget.value)}
                    className="w-full sm:w-64"
                  />

                  <Select
                    size="xs"
                    radius="md"
                    placeholder="Trạng thái"
                    leftSection={<IconFilter size={14} />}
                    value={statusFilter}
                    onChange={(val) => handleStatusChange(val || "all")}
                    data={[
                      { value: "all", label: "Tất cả trạng thái" },
                      { value: EvidenceStatusValues.APPROVED, label: "Đã duyệt" },
                      { value: EvidenceStatusValues.PENDING, label: "Chờ thẩm định" },
                      { value: EvidenceStatusValues.NEEDS_SUPPLEMENT, label: "Cần bổ sung" }
                    ]}
                    className="w-full sm:w-44"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                  <Table.Thead className="bg-slate-50 text-slate-700">
                    <Table.Tr>
                      <Table.Th>Mã / Tên Minh Chứng</Table.Th>
                      <Table.Th>Tiêu Chuẩn & Tiêu Chí</Table.Th>
                      <Table.Th>Ngày Nộp</Table.Th>
                      <Table.Th>Tệp Đính Kèm</Table.Th>
                      <Table.Th>Trạng Thái</Table.Th>
                      <Table.Th className="text-right">Thao Tác</Table.Th>
                    </Table.Tr>
                  </Table.Thead>

                  <Table.Tbody>
                    {displayEvidences.length === 0 ? (
                      <Table.Tr>
                        <Table.Td colSpan={6} className="text-center py-8 text-slate-500">
                          Chưa tìm thấy minh chứng nào phù hợp với giáo viên hiện tại.
                        </Table.Td>
                      </Table.Tr>
                    ) : (
                      displayEvidences.map((item) => (
                        <Table.Tr key={item.id}>
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
                            <div>
                              <Text size="xs" fw={600} className="text-slate-800">
                                {item.standardName}
                              </Text>
                              <Text size="xs" className="text-slate-500">
                                {item.criteriaName}
                              </Text>
                            </div>
                          </Table.Td>

                          <Table.Td>
                            <Text size="xs" className="text-slate-600 font-mono">
                              {item.date}
                            </Text>
                          </Table.Td>

                          <Table.Td>
                            <div className="flex items-center space-x-1.5 text-xs text-slate-700">
                              <IconBook size={14} className="text-blue-600" />
                              <span className="truncate max-w-[140px]">{item.originalFileName}</span>
                            </div>
                          </Table.Td>

                          <Table.Td>{getStatusBadge(item.currentStatus)}</Table.Td>

                          <Table.Td className="text-right">
                            <Tooltip label="Xem chi tiết & nhận xét">
                              <ActionIcon
                                variant="light"
                                color="blue"
                                size="sm"
                                onClick={() => setSelectedEvidence(item)}
                              >
                                <IconEye size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </Table.Td>
                        </Table.Tr>
                      ))
                    )}
                  </Table.Tbody>
                </Table>
              </div>

              {/* Pagination UI Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
                <Text size="xs" c="dimmed" fw={500}>
                  Hiển thị{" "}
                  <span className="font-semibold text-slate-800">
                    {totalItemCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                  </span>{" "}
                  -{" "}
                  <span className="font-semibold text-slate-800">
                    {Math.min(currentPage * pageSize, totalItemCount)}
                  </span>{" "}
                  trong tổng số{" "}
                  <span className="font-semibold text-blue-900">{totalItemCount}</span> minh chứng do giáo viên hiện tại tải lên
                </Text>

                <Pagination
                  total={totalPageCount}
                  value={currentPage}
                  onChange={setCurrentPage}
                  color="blue"
                  size="sm"
                  radius="md"
                  withEdges
                />
              </div>
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="matrix">
            <CriteriaMatrixTable evidences={evidences} />
          </Tabs.Panel>
        </Tabs>
      </main>

      {/* Modal: Nộp Minh Chứng Mới */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={
          <Group gap="xs">
            <IconFileUpload className="text-blue-900" size={20} />
            <Text fw={700}>Nộp Minh Chứng Sư Phạm Mới</Text>
          </Group>
        }
        radius="lg"
        size="lg"
        centered
      >
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
            onChange={(val) => {
              if (val) {
                setStandardName(val)
                const fObj = fields.find((f) => f.fieldName === val)
                if (fObj && fObj.criteria.length > 0) {
                  setCriteriaName(fObj.criteria[0].criteriaName)
                }
              }
            }}
          />

          <Select
            label="Thuộc Tiêu chí cụ thể"
            data={criteriaOptions}
            value={criteriaName}
            onChange={(val) => setCriteriaName(val || "")}
          />

          <FileInput
            label="Tệp minh chứng đính kèm (PDF, DOCX, JPG, PNG, TXT)"
            placeholder="Chọn một hoặc nhiều tệp minh chứng (tổng <= 5MB)..."
            required
            multiple
            clearable
            leftSection={<IconFileUpload size={16} />}
            value={selectedFiles || undefined}
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt,image/*"
            error={fileError}
          />

          <Textarea
            label="Ghi chú / Mô tả bổ sung"
            placeholder="Thông tin trích yếu, số quyết định hoặc liên kết xác minh..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
          />

          <div className="pt-3 flex justify-end space-x-2">
            <Button variant="default" onClick={() => setModalOpened(false)}>
              Hủy
            </Button>
            <Button type="submit" color="brand" leftSection={<IconCheck size={16} />}>
              Lưu & Gửi Nộp
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Details / Review Comments */}
      {selectedEvidence && (
        <Modal
          opened={!!selectedEvidence}
          onClose={() => setSelectedEvidence(null)}
          title={
            <Group gap="xs">
              <IconFileText size={20} className="text-blue-900" />
              <Text fw={700}>Chi Tiết Minh Chứng #{selectedEvidence.evidenceId}</Text>
            </Group>
          }
          radius="lg"
          size="md"
          centered
        >
          <div className="space-y-4">
            <div>
              <Text size="xs" c="dimmed">Tên minh chứng:</Text>
              <Text fw={700} size="sm" className="text-slate-900">{selectedEvidence.title}</Text>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <Text size="xs" c="dimmed">Ngày nộp:</Text>
                <Text fw={600}>{selectedEvidence.date}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">Trạng thái:</Text>
                <div>{getStatusBadge(selectedEvidence.currentStatus)}</div>
              </div>
            </div>

            <div>
              <Text size="xs" c="dimmed">Tiêu chuẩn & Tiêu chí:</Text>
              <Text size="xs" fw={600} className="text-slate-800">{selectedEvidence.standardName}</Text>
              <Text size="xs" className="text-slate-600">{selectedEvidence.criteriaName}</Text>
            </div>

            {selectedEvidence.reviewComment && (
              <Alert color="blue" title="Nhận xét từ Tổ trưởng / BGH">
                <Text size="xs">{selectedEvidence.reviewComment}</Text>
              </Alert>
            )}

            <div className="pt-2 flex justify-end">
              <Button size="xs" onClick={() => setSelectedEvidence(null)}>
                Đóng
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
