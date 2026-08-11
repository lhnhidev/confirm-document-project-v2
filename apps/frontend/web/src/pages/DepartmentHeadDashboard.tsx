/* eslint-disable no-unused-vars */
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
  Tabs,
  Avatar,
  Progress,
  Card
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
  IconSend
} from "@tabler/icons-react"
import { addCommentApi, deleteCommentApi } from "../services/evidenceApi"
import type { User, EvidenceItem, EvidenceStatus } from "../types/auth"
import { EvidenceStatus as EvidenceStatusValues } from "../types/auth"
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

export default function DepartmentHeadDashboard({
  currentUser,
  evidences,
  onUpdateStatus,
  onLogout,
  onUserUpdate,
  onUpdateEvidence
}: DepartmentHeadDashboardProps) {
  const nowTime = Date.now()
  const [activeTab, setActiveTab] = useState<string>("pending")
  const [pendingSearchQuery, setPendingSearchQuery] = useState("")
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null)
  const [reviewComment, setReviewComment] = useState("")
  const [activeAttachmentIdx, setActiveAttachmentIdx] = useState<number>(0)
  
  // Comments Timeline States
  const [newCommentText, setNewCommentText] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [modalTab, setModalTab] = useState<string>("details")

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

  // Pending and evaluated evidences of teachers (excluding heads/vice heads)
  const departmentEvidences = evidences.filter(
    (e) =>
      e.submittedBy.departmentName === currentUser.departmentName &&
      e.submittedBy.role === "TEACHER" &&
      e.submittedBy.userId !== currentUser.userId
  )

  const pendingEvidences = departmentEvidences.filter(
    (e) => e.currentStatus === EvidenceStatusValues.PENDING
  )

  const filteredPendingEvidences = pendingEvidences.filter((item) => {
    if (!pendingSearchQuery.trim()) return true
    const q = pendingSearchQuery.toLowerCase().trim()
    const nameMatch = item.submittedBy.fullName.toLowerCase().includes(q)
    const emailMatch = item.submittedBy.email ? item.submittedBy.email.toLowerCase().includes(q) : false
    const codeMatch = item.evidenceId ? item.evidenceId.toLowerCase().includes(q) : false
    const titleMatch = item.title ? item.title.toLowerCase().includes(q) : false
    return nameMatch || emailMatch || codeMatch || titleMatch
  })

  const reviewedEvidences = departmentEvidences.filter(
    (e) => e.currentStatus !== EvidenceStatusValues.PENDING
  )

  const filteredList = activeTab === "pending" ? filteredPendingEvidences : reviewedEvidences

  // Teachers in this department
  const departmentTeachers = [
    {
      name: "Tống Thị Tuyết Huệ",
      email: "ttthuedtnt@gmail.com",
      major: "An ninh quốc phòng",
      totalSubmitted: 4,
      approved: 2,
      pending: 1,
      completionRate: 80
    },
    {
      name: "Lê Thị Ngọc Hơn",
      email: "lethingochon.dtnt@gmail.com",
      major: "Tin học",
      totalSubmitted: 6,
      approved: 5,
      pending: 1,
      completionRate: 92
    },
    {
      name: "Nguyễn Văn An",
      email: "nguyenvanan@baclieu.edu.vn",
      major: "Thể dục",
      totalSubmitted: 3,
      approved: 3,
      pending: 0,
      completionRate: 100
    }
  ]

  const handleApprove = (evidence: EvidenceItem) => {
    onUpdateStatus(evidence.id, EvidenceStatusValues.APPROVED, reviewComment || "Tổ trưởng đã duyệt minh chứng đạt chuẩn.")
    setSelectedEvidence(null)
    setReviewComment("")
  }

  const handleRequestSupplement = (evidence: EvidenceItem) => {
    onUpdateStatus(evidence.id, EvidenceStatusValues.NEEDS_SUPPLEMENT, reviewComment || "Vui lòng đính kèm tệp có chữ ký đóng dấu bổ sung.")
    setSelectedEvidence(null)
    setReviewComment("")
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-12">
      <AppHeader currentUser={currentUser} onLogout={onLogout} onUserUpdate={onUserUpdate} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Banner Welcome Card */}
        <Paper className="p-6 sm:p-8 bg-brand-gradient text-white shadow-lg rounded-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center space-x-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200 border border-emerald-400/30">
                <IconBuildingSkyscraper size={14} />
                <span>Cổng Thẩm Định Tổ Chuyên Môn • {currentUser.departmentName}</span>
              </div>
              <Title order={2} className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Tổ trưởng: {currentUser.fullName}
              </Title>
              <Text size="sm" className="text-slate-300">
                Chịu trách nhiệm thẩm định & đánh giá minh chứng sư phạm của giáo viên thuộc Tổ {currentUser.departmentName}.
              </Text>
            </div>

            <Badge size="xl" color="emerald" variant="filled" className="shrink-0 font-bold shadow-md">
              Tỷ lệ thẩm định tổ: 88%
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
                  {departmentEvidences.filter((e) => e.currentStatus === EvidenceStatusValues.APPROVED).length}
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
                  {departmentTeachers.length} <span className="text-xs font-normal text-slate-500">thành viên</span>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {departmentTeachers.map((teacher, idx) => (
                  <Card key={idx} padding="lg" radius="md" className="border border-slate-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Avatar color="blue" radius="xl" size="md">
                        {teacher.name.split(" ").slice(-1)[0][0]}
                      </Avatar>
                      <div>
                        <Text size="sm" fw={700} className="text-slate-900">{teacher.name}</Text>
                        <Text size="xs" c="dimmed">Môn: {teacher.major}</Text>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span>Đã nộp:</span>
                        <span className="font-semibold">{teacher.totalSubmitted} tệp</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Đã duyệt:</span>
                        <span className="font-semibold text-emerald-600">{teacher.approved} tệp</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Chờ thẩm định:</span>
                        <span className="font-semibold text-amber-600">{teacher.pending} tệp</span>
                      </div>

                      <div className="pt-2">
                        <div className="flex justify-between mb-1">
                          <span className="font-semibold text-slate-700">Tiến độ tiêu chí:</span>
                          <span className="font-bold text-blue-900">{teacher.completionRate}%</span>
                        </div>
                        <Progress value={teacher.completionRate} color="emerald" radius="xl" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Tabs.Panel>

            <Tabs.Panel value="matrix" className="pt-4">
              <CriteriaMatrixTable evidences={evidences} />
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
                          label="Nhận xét & Đánh giá của Tổ trưởng"
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
    </div>
  )
}
