import { useState } from "react"
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
  Select,
  Progress,
  Card,
  Avatar,
  Tabs
} from "@mantine/core"
import {
  IconSchool,
  IconClock,
  IconSearch,
  IconAward,
  IconChartBar,
  IconShieldCheck,
  IconDownload,
  IconTable,
  IconChartPie,
  IconListCheck,
  IconUsers,
  IconCheck,
  IconAlertTriangle,
  IconEye,
  IconCertificate,
  IconFileText,
  IconMessage,
  IconSend,
  IconExternalLink
} from "@tabler/icons-react"
import { addCommentApi, deleteCommentApi } from "../services/evidenceApi"
import type { User, EvidenceItem, EvidenceStatus } from "../types/auth"
import { EvidenceStatus as EvidenceStatusValues } from "../types/auth"
import AppHeader from "../components/AppHeader"
import CriteriaMatrixTable from "../components/CriteriaMatrixTable"
import TeacherProgressStatsView from "../components/TeacherProgressStatsView"
import UserContactsTab from "../components/UserContactsTab"

interface SchoolBoardDashboardProps {
  currentUser: User
  evidences: EvidenceItem[]
  onLogout: () => void
  onUserUpdate?: (_updatedUser: User) => void
  onUpdateStatus?: (_id: string, _status: EvidenceStatus, _comment?: string) => void
  onUpdateEvidence?: (_updatedItem: EvidenceItem) => void
}

export default function SchoolBoardDashboard({
  currentUser,
  evidences,
  onLogout,
  onUserUpdate,
  onUpdateStatus,
  onUpdateEvidence
}: SchoolBoardDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")

  // Review states
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null)
  const [reviewComment, setReviewComment] = useState("")
  const [activeAttachmentIdx, setActiveAttachmentIdx] = useState<number>(0)
  const [modalTab, setModalTab] = useState<string>("details")
  const [newCommentText, setNewCommentText] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  const handleAddComment = async () => {
    if (!newCommentText.trim() || !selectedEvidence) return
    setIsSubmittingComment(true)
    const updated = await addCommentApi(selectedEvidence.id, newCommentText)
    if (updated) {
      setNewCommentText("")
      setSelectedEvidence(updated)
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

  const submitStatusUpdate = async (status: EvidenceStatus) => {
    if (!selectedEvidence || !onUpdateStatus) return
    await onUpdateStatus(selectedEvidence.id, status, reviewComment)
    
    // Update local state to reflect change immediately in the modal
    setSelectedEvidence({
      ...selectedEvidence,
      currentStatus: status,
      reviewComment: reviewComment
    })
    setReviewComment("")
  }

  // Department Summaries
  const departments = [
    {
      name: "Tổ Tự Nhiên",
      headName: "Nguyễn Chơn Nhất Hữu",
      teacherCount: 14,
      approvedCount: 156,
      pendingCount: 8,
      completionRate: 95
    },
    {
      name: "Tổ Xã Hội",
      headName: "Phạm Văn Minh",
      teacherCount: 12,
      approvedCount: 120,
      pendingCount: 12,
      completionRate: 88
    },
    {
      name: "Tổ Tổng Hợp",
      headName: "Lê Thị Ngọc Hơn",
      teacherCount: 11,
      approvedCount: 98,
      pendingCount: 5,
      completionRate: 91
    },
    {
      name: "Tổ Ngoại Ngữ",
      headName: "Trần Thị Mai",
      teacherCount: 8,
      approvedCount: 85,
      pendingCount: 3,
      completionRate: 94
    }
  ]

  const filteredEvidences = evidences.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.submittedBy.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.submittedBy.departmentName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDept =
      departmentFilter === "all" || item.submittedBy.departmentName === departmentFilter

    return matchesSearch && matchesDept
  })

  const totalTeachers = 45
  const totalApproved = evidences.filter((e) => e.currentStatus === EvidenceStatusValues.APPROVED).length
  const totalPending = evidences.filter((e) => e.currentStatus === EvidenceStatusValues.PENDING).length

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-12">
      <AppHeader currentUser={currentUser} onLogout={onLogout} onUserUpdate={onUserUpdate} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Banner Welcome Card */}
        <Paper className="p-6 sm:p-8 bg-brand-gradient text-white shadow-lg rounded-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center space-x-2 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-200 border border-amber-400/30">
                <IconShieldCheck size={14} />
                <span>Hội Đồng Kiểm Định Chất Lượng Giáo Dục THPT 2026</span>
              </div>
              <Title order={2} className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Ban Giám Hiệu: {currentUser.fullName}
              </Title>
              <Text size="sm" className="text-slate-300">
                Theo dõi tiến độ số hóa minh chứng sư phạm và phê duyệt chuẩn nghề nghiệp giáo viên toàn trường.
              </Text>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                size="md"
                color="amber"
                radius="md"
                leftSection={<IconDownload size={18} />}
                onClick={() => alert("Đã xuất báo cáo tổng hợp chuẩn đánh giá giáo viên toàn trường (File Excel/PDF).")}
                className="shadow-lg hover:shadow-xl shrink-0 text-slate-900 font-bold"
              >
                Xuất Báo Cáo Kiểm Định
              </Button>
            </div>
          </div>
        </Paper>

        {/* Top School Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card padding="lg" radius="lg" className="border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <Text size="xs" c="dimmed" fw={600} className="uppercase tracking-wider">
                  Tổng Số Giáo Viên
                </Text>
                <Text size="xl" fw={800} className="mt-1 text-slate-900">
                  {totalTeachers} <span className="text-xs font-normal text-slate-500">cán bộ</span>
                </Text>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <IconSchool size={24} />
              </div>
            </div>
          </Card>

          <Card padding="lg" radius="lg" className="border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <Text size="xs" c="dimmed" fw={600} className="uppercase tracking-wider">
                  Tỷ Lệ Hoàn Thành Toàn Trường
                </Text>
                <Text size="xl" fw={800} className="mt-1 text-emerald-600">
                  92.4%
                </Text>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <IconChartBar size={24} />
              </div>
            </div>
            <Progress value={92.4} color="emerald" size="sm" radius="xl" className="mt-3" />
          </Card>

          <Card padding="lg" radius="lg" className="border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <Text size="xs" c="dimmed" fw={600} className="uppercase tracking-wider">
                  Minh Chứng Đã Thẩm Định
                </Text>
                <Text size="xl" fw={800} className="mt-1 text-blue-900">
                  {totalApproved + 450} <span className="text-xs font-normal text-slate-500">tệp</span>
                </Text>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <IconAward size={24} />
              </div>
            </div>
          </Card>

          <Card padding="lg" radius="lg" className="border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <Text size="xs" c="dimmed" fw={600} className="uppercase tracking-wider">
                  Chờ BGH Phê Duyệt Cấp Trường
                </Text>
                <Text size="xl" fw={800} className="mt-1 text-amber-600">
                  {totalPending + 12} <span className="text-xs font-normal text-slate-500">hồ sơ</span>
                </Text>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <IconClock size={24} />
              </div>
            </div>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="overview" variant="outline" radius="md">
          <Tabs.List className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm mb-4">
            <Tabs.Tab value="overview" leftSection={<IconListCheck size={16} />} className="font-bold">
              Tổng Quan & Tra Cứu Toàn Trường
            </Tabs.Tab>
            <Tabs.Tab value="leader_review" leftSection={<IconShieldCheck size={16} />} className="font-bold text-red-900">
              Duyệt Tổ Trưởng & Tổ Phó
            </Tabs.Tab>
            <Tabs.Tab value="teacher_stats" leftSection={<IconChartPie size={16} />} className="font-bold text-amber-900">
              Thống Kê Tiến Độ Giáo Viên (API Backend)
            </Tabs.Tab>
            <Tabs.Tab value="matrix" leftSection={<IconTable size={16} />} className="font-bold text-blue-900">
              8 Tiêu Chuẩn & 35 Tiêu Chí (Khung Đánh Giá)
            </Tabs.Tab>
            <Tabs.Tab value="contacts" leftSection={<IconUsers size={16} />} className="font-bold text-teal-900">
              Danh Bạ Người Dùng
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" className="space-y-6">
            {/* Department Overview Cards */}
            <Paper p="lg" radius="lg" className="border border-slate-200 bg-white shadow-sm space-y-4">
              <Title order={3} className="text-lg font-bold text-slate-900">
                Tiến Độ Thẩm Định Theo Tổ Chuyên Môn
              </Title>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {departments.map((dept, index) => (
                  <Card key={index} padding="md" radius="md" className="border border-slate-200 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <Text fw={700} size="sm" className="text-slate-900">{dept.name}</Text>
                      <Badge color="blue" size="xs">{dept.teacherCount} giáo viên</Badge>
                    </div>
                    <Text size="xs" c="dimmed" className="mb-3">
                      Tổ trưởng: {dept.headName}
                    </Text>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Đã đạt chuẩn:</span>
                        <span className="font-semibold text-emerald-600">{dept.approvedCount} tệp</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Đang thẩm định:</span>
                        <span className="font-semibold text-amber-600">{dept.pendingCount} tệp</span>
                      </div>

                      <div className="pt-2">
                        <div className="flex justify-between mb-1">
                          <span className="font-semibold text-slate-700">Tỷ lệ hoàn thành:</span>
                          <span className="font-bold text-blue-900">{dept.completionRate}%</span>
                        </div>
                        <Progress value={dept.completionRate} color="emerald" radius="xl" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Paper>

            {/* Global Evidence Search & Approval Table */}
            <Paper p="lg" radius="lg" className="border border-slate-200 bg-white shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <Title order={3} className="text-lg font-bold text-slate-900">
                    Tra Cứu & Giám Sát Minh Chứng Toàn Trường
                  </Title>
                  <Text size="xs" c="dimmed">
                    Tra cứu dữ liệu minh chứng sư phạm của 45 giáo viên theo các Tiêu chuẩn đánh giá nghề nghiệp.
                  </Text>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <TextInput
                    placeholder="Tìm tên giáo viên, minh chứng..."
                    size="xs"
                    radius="md"
                    leftSection={<IconSearch size={14} />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.currentTarget.value)}
                    className="w-full sm:w-64"
                  />

                  <Select
                    size="xs"
                    radius="md"
                    value={departmentFilter}
                    onChange={(val) => setDepartmentFilter(val || "all")}
                    data={[
                      { value: "all", label: "Tất cả các tổ" },
                      { value: "Tổng hợp", label: "Tổ Tổng Hợp" },
                      { value: "Tự nhiên", label: "Tổ Tự Nhiên" },
                      { value: "Xã hội", label: "Tổ Xã Hội" }
                    ]}
                    className="w-full sm:w-44"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                  <Table.Thead className="bg-slate-50 text-slate-700">
                    <Table.Tr>
                      <Table.Th>Giáo Viên Nộp</Table.Th>
                      <Table.Th>Tổ Chuyên Môn</Table.Th>
                      <Table.Th>Mã / Tên Minh Chứng</Table.Th>
                      <Table.Th>Tiêu Chuẩn</Table.Th>
                      <Table.Th>Trạng Thái Thẩm Định</Table.Th>
                    </Table.Tr>
                  </Table.Thead>

                  <Table.Tbody>
                    {filteredEvidences.length === 0 ? (
                      <Table.Tr>
                        <Table.Td colSpan={5} className="text-center py-8 text-slate-500">
                          Không tìm thấy dữ liệu.
                        </Table.Td>
                      </Table.Tr>
                    ) : (
                      filteredEvidences.map((item) => (
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
                            <Badge variant="light" color="blue" size="xs">
                              {item.submittedBy.departmentName}
                            </Badge>
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
                          </Table.Td>

                          <Table.Td>
                            {item.currentStatus === EvidenceStatusValues.APPROVED && (
                              <Badge color="emerald">Đã đạt chuẩn</Badge>
                            )}
                            {item.currentStatus === EvidenceStatusValues.PENDING && (
                              <Badge color="amber">Đang duyệt</Badge>
                            )}
                            {item.currentStatus === EvidenceStatusValues.NEEDS_SUPPLEMENT && (
                              <Badge color="red">Chờ bổ sung</Badge>
                            )}
                          </Table.Td>
                        </Table.Tr>
                      ))
                    )}
                  </Table.Tbody>
                </Table>
              </div>
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="leader_review" className="space-y-6">
            <Paper p="lg" radius="lg" className="border border-slate-200 bg-white shadow-sm space-y-4">
              <div>
                <Title order={3} className="text-lg font-bold text-slate-900">
                  Phê Duyệt Minh Chứng Của Tổ Trưởng & Tổ Phó
                </Title>
                <Text size="xs" c="dimmed">
                  Danh sách minh chứng sư phạm của Tổ trưởng, Tổ phó các Tổ chuyên môn thuộc thẩm quyền phê duyệt của Ban Giám Hiệu.
                </Text>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                  <Table.Thead className="bg-slate-50 text-slate-700">
                    <Table.Tr>
                      <Table.Th>Người Nộp</Table.Th>
                      <Table.Th>Vai Trò / Tổ</Table.Th>
                      <Table.Th>Mã / Tên Minh Chứng</Table.Th>
                      <Table.Th>Tiêu Chuẩn</Table.Th>
                      <Table.Th>Trạng Thái Thẩm Định</Table.Th>
                      <Table.Th>Thao Tác</Table.Th>
                    </Table.Tr>
                  </Table.Thead>

                  <Table.Tbody>
                    {(() => {
                      const leaderEvs = evidences.filter((item) => {
                        const isLeader =
                          item.submittedBy.role === "DEPARTMENT_HEAD" ||
                          item.submittedBy.role === "DEPARTMENT_VICE_HEAD"

                        const matchesSearch =
                          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.submittedBy.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.submittedBy.departmentName.toLowerCase().includes(searchQuery.toLowerCase())

                        const matchesDept =
                          departmentFilter === "all" || item.submittedBy.departmentName === departmentFilter

                        return isLeader && matchesSearch && matchesDept
                      })

                      if (leaderEvs.length === 0) {
                        return (
                          <Table.Tr>
                            <Table.Td colSpan={6} className="text-center py-8 text-slate-500">
                              Không tìm thấy minh chứng nào từ Tổ trưởng/Tổ phó cần phê duyệt.
                            </Table.Td>
                          </Table.Tr>
                        )
                      }

                      return leaderEvs.map((item) => (
                        <Table.Tr key={item.id}>
                          <Table.Td>
                            <div className="flex items-center space-x-2">
                              <Avatar color="red" radius="xl" size="sm">
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
                            <div className="flex flex-col gap-1">
                              <Badge color="red" size="xs">
                                {item.submittedBy.role === "DEPARTMENT_HEAD" ? "Tổ trưởng" : "Tổ phó"}
                              </Badge>
                              <Text size="xs" className="text-slate-500">
                                {item.submittedBy.departmentName}
                              </Text>
                            </div>
                          </Table.Td>

                          <Table.Td>
                            <div>
                              <Text size="xs" fw={700} className="text-red-900 font-mono">
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
                          </Table.Td>

                          <Table.Td>
                            {item.currentStatus === EvidenceStatusValues.APPROVED && (
                              <Badge color="emerald">Đã đạt chuẩn</Badge>
                            )}
                            {item.currentStatus === EvidenceStatusValues.PENDING && (
                              <Badge color="amber">Đang duyệt</Badge>
                            )}
                            {item.currentStatus === EvidenceStatusValues.NEEDS_SUPPLEMENT && (
                              <Badge color="red">Chờ bổ sung</Badge>
                            )}
                          </Table.Td>

                          <Table.Td>
                            <Button
                              size="xs"
                              color="blue"
                              variant="light"
                              leftSection={<IconEye size={12} />}
                              onClick={() => {
                                setSelectedEvidence(item)
                                setReviewComment(item.reviewComment || "")
                                setModalTab("details")
                                setNewCommentText("")
                              }}
                            >
                              Thẩm Định
                            </Button>
                          </Table.Td>
                        </Table.Tr>
                      ))
                    })()}
                  </Table.Tbody>
                </Table>
              </div>
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="teacher_stats">
            <TeacherProgressStatsView />
          </Tabs.Panel>

          <Tabs.Panel value="matrix">
            <CriteriaMatrixTable evidences={evidences} />
          </Tabs.Panel>

          <Tabs.Panel value="contacts" className="pt-4">
            <UserContactsTab />
          </Tabs.Panel>
        </Tabs>
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
                        value="comments" 
                        leftSection={<IconMessage size={14} />}
                        rightSection={
                          selectedEvidence.commentsCount || selectedEvidence.comments?.length ? (
                            <Badge size="xs" circle color="blue">
                              {selectedEvidence.commentsCount || selectedEvidence.comments?.length}
                            </Badge>
                          ) : null
                        }
                      >
                        Bình Luận
                      </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="details" className="space-y-4 flex-1 overflow-y-auto pr-1">
                      <div>
                        <Text size="xs" c="dimmed">Tiêu chuẩn / Tiêu chí</Text>
                        <Text size="xs" fw={700} className="text-slate-900 mt-0.5">{selectedEvidence.standardName}</Text>
                        <Text size="sm" fw={600} className="text-slate-700 mt-1 font-sans">{selectedEvidence.criteriaName}</Text>
                      </div>

                      <div>
                        <Text size="xs" c="dimmed">Tên minh chứng</Text>
                        <Text size="sm" fw={700} className="text-blue-900 mt-0.5">{selectedEvidence.title}</Text>
                      </div>

                      {selectedEvidence.description && (
                        <div>
                          <Text size="xs" c="dimmed">Mô tả chi tiết</Text>
                          <Paper p="xs" radius="md" className="bg-slate-50 border border-slate-100 mt-1">
                            <Text size="xs" className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                              {selectedEvidence.description}
                            </Text>
                          </Paper>
                        </div>
                      )}

                      <div className="border-t border-slate-100 pt-3">
                        <Text size="xs" fw={700} className="text-slate-900 mb-2">Thẩm Định & Phản Hồi Trạng Thái</Text>
                        <Textarea
                          placeholder="Nhập ý kiến thẩm định, nhận xét hoặc yêu cầu bổ sung nếu có..."
                          minRows={3}
                          maxRows={5}
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.currentTarget.value)}
                          className="font-sans text-xs"
                          radius="md"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <Button
                          color="red"
                          variant="light"
                          radius="md"
                          leftSection={<IconAlertTriangle size={14} />}
                          onClick={() => submitStatusUpdate(EvidenceStatusValues.NEEDS_SUPPLEMENT)}
                          className="font-bold text-xs"
                        >
                          Cần Bổ Sung
                        </Button>
                        <Button
                          color="emerald"
                          radius="md"
                          leftSection={<IconCheck size={14} />}
                          onClick={() => submitStatusUpdate(EvidenceStatusValues.APPROVED)}
                          className="font-bold text-xs shadow-md"
                        >
                          Duyệt Đạt Chuẩn
                        </Button>
                      </div>
                    </Tabs.Panel>

                    <Tabs.Panel value="comments" className="flex flex-col flex-1 h-full overflow-hidden">
                      {/* Comments List */}
                      <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-3">
                        {!selectedEvidence.comments || selectedEvidence.comments.length === 0 ? (
                          <div className="text-center py-12 text-slate-400">
                            <IconMessage size={36} className="mx-auto opacity-30 mb-2" />
                            <Text size="xs">Chưa có bình luận nào cho minh chứng này.</Text>
                          </div>
                        ) : (
                          selectedEvidence.comments.map((comment: any) => {
                            const isMine = comment.userId === currentUser.userId;
                            return (
                              <div key={comment._id || comment.commentId} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                                <div className="flex items-center space-x-1 mb-1">
                                  <Text size="xs" fw={700} className="text-slate-700">
                                    {comment.fullName}
                                  </Text>
                                  <Text size="10px" c="dimmed">
                                    • {comment.role === "DEPARTMENT_HEAD" ? "Tổ trưởng" : comment.role === "DEPARTMENT_VICE_HEAD" ? "Tổ phó" : comment.role === "TEACHER" ? "Giáo viên" : "BGH"}
                                  </Text>
                                </div>
                                <div className={`p-2.5 rounded-2xl text-xs max-w-[85%] leading-relaxed border shadow-sm ${
                                  isMine 
                                    ? "bg-blue-600 text-white border-blue-500 rounded-tr-none" 
                                    : "bg-white text-slate-800 border-slate-200 rounded-tl-none"
                                }`}>
                                  <p className="whitespace-pre-wrap">{comment.content}</p>
                                </div>
                                <div className="flex items-center space-x-2 mt-1 px-1">
                                  <Text size="10px" c="dimmed">
                                    {new Date(comment.createdAt).toLocaleTimeString("vi-VN", {hour: "2-digit", minute:"2-digit"})}
                                  </Text>
                                  {isMine && (
                                    <button 
                                      onClick={() => handleRecallComment(comment._id || comment.commentId)}
                                      className="text-[10px] text-red-500 hover:underline border-none bg-transparent cursor-pointer p-0"
                                    >
                                      Thu hồi
                                    </button>
                                  )}
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>

                      {/* Comment Input */}
                      <div className="border-t border-slate-100 pt-3">
                        <Group gap="xs" align="flex-end" wrap="nowrap">
                          <Textarea
                            placeholder="Viết phản hồi bình luận..."
                            minRows={1}
                            maxRows={3}
                            autosize
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.currentTarget.value)}
                            className="flex-1 text-xs"
                            radius="md"
                          />
                          <Button
                            color="blue"
                            radius="md"
                            loading={isSubmittingComment}
                            onClick={handleAddComment}
                            className="h-9 w-9 p-0 flex items-center justify-center shrink-0 shadow-md"
                          >
                            <IconSend size={16} />
                          </Button>
                        </Group>
                      </div>
                    </Tabs.Panel>
                  </Tabs>
                </div>

                {/* RIGHT COLUMN: Attachments & Document Live View */}
                <div className="lg:col-span-7 flex flex-col h-[520px] bg-slate-50 rounded-xl border border-slate-200 p-4 overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
                    <div>
                      <Text size="xs" fw={700} className="text-slate-900">Tệp minh chứng đính kèm</Text>
                      <Text size="10px" c="dimmed">Chọn tệp bên dưới để xem trực tiếp hoặc tải về</Text>
                    </div>
                    {attachmentsList.length > 1 && (
                      <Badge color="blue" size="sm">{attachmentsList.length} tệp tin</Badge>
                    )}
                  </div>

                  {attachmentsList.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-white rounded-lg border border-dashed border-slate-200 p-6">
                      <IconFileText size={48} className="stroke-[1] opacity-30 mb-3" />
                      <Text size="sm" fw={600}>Không có tệp đính kèm nào</Text>
                      <Text size="xs" className="text-center mt-1">Minh chứng này chỉ dùng liên kết URL bên ngoài</Text>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col min-h-0">
                      {/* Attachment Selector Tabs if multiple */}
                      {attachmentsList.length > 1 && (
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 border-b border-slate-100 max-w-full">
                          {attachmentsList.map((file, idx) => (
                            <button
                              key={idx}
                              onClick={() => setActiveAttachmentIdx(idx)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                                activeAttachmentIdx === idx
                                  ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
                                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              {file.name}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Display Selected Attachment Content */}
                      {activeAttachment && (
                        <div className="flex-1 flex flex-col min-h-0 bg-white rounded-lg border border-slate-200 p-3 shadow-inner">
                          {/* Top File Metadata */}
                          <div className="flex items-center justify-between mb-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <div className="flex items-center space-x-2 min-w-0">
                              <span className="p-1.5 bg-blue-50 text-blue-600 rounded-md font-mono text-[10px] uppercase font-bold shrink-0">
                                {ext}
                              </span>
                              <div className="min-w-0">
                                <Text size="xs" fw={700} className="text-slate-900 truncate max-w-[200px] md:max-w-[260px]">
                                  {activeAttachment.name}
                                </Text>
                                {activeAttachment.size > 0 && (
                                  <Text size="10px" c="dimmed">
                                    {(activeAttachment.size / 1024).toFixed(1)} KB
                                  </Text>
                                )}
                              </div>
                            </div>

                            <Button
                              size="xs"
                              color="blue"
                              variant="light"
                              leftSection={<IconDownload size={12} />}
                              onClick={() => handleDownload(activeAttachment.url, activeAttachment.name)}
                              className="font-bold text-[10px] px-2 h-7"
                            >
                              Tải Về
                            </Button>
                          </div>

                          {/* Live view box */}
                          <div className="flex-1 bg-slate-100 rounded-md overflow-hidden relative border border-slate-200 min-h-0 flex flex-col justify-center items-center">
                            {ext === "pdf" ? (
                              <iframe
                                src={`/api/evidences/view-proxy?url=${encodeURIComponent(activeAttachment.url)}`}
                                className="w-full h-full border-none rounded-md"
                                title="Live Preview PDF"
                              />
                            ) : ["png", "jpg", "jpeg", "gif", "webp"].includes(ext) ? (
                              <div className="w-full h-full overflow-auto flex items-center justify-center p-2 bg-slate-200/50">
                                <img
                                  src={activeAttachment.url}
                                  alt={activeAttachment.name}
                                  className="max-w-full max-h-full object-contain rounded-md shadow-md border border-slate-300"
                                  onError={(e) => {
                                    // Fallback to proxy if direct load fails (CORS)
                                    (e.target as HTMLImageElement).src = `/api/evidences/view-proxy?url=${encodeURIComponent(activeAttachment.url)}`;
                                  }}
                                />
                              </div>
                            ) : isUrl ? (
                              <div className="text-center p-6 space-y-3">
                                <IconExternalLink size={40} className="mx-auto text-blue-600 stroke-[1.5]" />
                                <Text size="xs" fw={600} className="text-slate-700">Liên kết URL bên ngoài</Text>
                                <Text size="10px" c="dimmed" className="max-w-xs mx-auto">
                                  Tài liệu được liên kết tới một hệ thống khác. Bấm nút bên dưới để mở trong tab mới.
                                </Text>
                                <Button
                                  size="xs"
                                  color="blue"
                                  component="a"
                                  href={activeAttachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  rightSection={<IconExternalLink size={12} />}
                                  className="font-bold shadow-sm"
                                >
                                  Mở liên kết gốc
                                </Button>
                              </div>
                            ) : (
                              <div className="text-center p-6 space-y-2">
                                <IconFileText size={40} className="mx-auto text-slate-400 stroke-[1.5]" />
                                <Text size="xs" fw={600} className="text-slate-700">Không hỗ trợ xem trực tiếp</Text>
                                <Text size="10px" c="dimmed" className="max-w-xs mx-auto">
                                  Định dạng .{ext} không hỗ trợ xem trực tuyến. Vui lòng bấm nút Tải Về ở trên để xem nội dung chi tiết.
                                </Text>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  )
}
