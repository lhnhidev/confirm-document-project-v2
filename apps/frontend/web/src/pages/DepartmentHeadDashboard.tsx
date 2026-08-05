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
  IconChartPie,
  IconDownload,
  IconExternalLink,
  IconFileText,
  IconLink
} from "@tabler/icons-react"
import type { User, EvidenceItem, EvidenceStatus } from "../types/auth"
import { EvidenceStatus as EvidenceStatusValues } from "../types/auth"
import AppHeader from "../components/AppHeader"
import CriteriaMatrixTable from "../components/CriteriaMatrixTable"
import TeacherProgressStatsView from "../components/TeacherProgressStatsView"
import UserContactsTab from "../components/UserContactsTab"

interface DepartmentHeadDashboardProps {
  currentUser: User
  evidences: EvidenceItem[]
  onUpdateStatus: (_id: string, _status: EvidenceStatus, _comment?: string) => void
  onLogout: () => void
  onUserUpdate?: (_updatedUser: User) => void
}

export default function DepartmentHeadDashboard({
  currentUser,
  evidences,
  onUpdateStatus,
  onLogout,
  onUserUpdate
}: DepartmentHeadDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("pending")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null)
  const [reviewComment, setReviewComment] = useState("")
  const [showPreview, setShowPreview] = useState<boolean>(false)

  const handleDownload = (url: string, filename: string) => {
    if (!url || url === "#") {
      return
    }
    window.location.href = `/api/evidences/download-proxy?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`
  }

  // Pending and evaluated evidences
  const departmentEvidences = evidences.filter(
    (e) => e.submittedBy.departmentName === currentUser.departmentName
  )

  const pendingEvidences = departmentEvidences.filter(
    (e) => e.currentStatus === EvidenceStatusValues.PENDING
  )

  const reviewedEvidences = departmentEvidences.filter(
    (e) => e.currentStatus !== EvidenceStatusValues.PENDING
  )

  const filteredList = (activeTab === "pending" ? pendingEvidences : reviewedEvidences).filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.submittedBy.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.standardName.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
                  Đã Duyệt Trong Tháng
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
                  value="teacher_stats"
                  leftSection={<IconChartPie size={16} />}
                  className="font-semibold text-sm text-amber-900"
                >
                  Thống Kê API Backend
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

              {activeTab !== "teachers" && (
                <TextInput
                  placeholder="Tìm kiếm giáo viên, minh chứng..."
                  size="xs"
                  radius="md"
                  leftSection={<IconSearch size={14} />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.currentTarget.value)}
                  className="w-full sm:w-64"
                />
              )}
            </div>

            {/* Tab 1 & 2: Evidence Tables */}
            {(activeTab === "pending" || activeTab === "reviewed") && (
              <Tabs.Panel value={activeTab} className="pt-4">
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
                                  setShowPreview(false)
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

            <Tabs.Panel value="teacher_stats" className="pt-4">
              <TeacherProgressStatsView />
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
            setShowPreview(false)
          }}
          title={
            <Group gap="xs">
              <IconCertificate size={20} className="text-blue-900" />
              <Text fw={700}>Thẩm Định Minh Chứng #{selectedEvidence.evidenceId}</Text>
            </Group>
          }
          radius="lg"
          size="lg"
          centered
        >
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
              <Text size="sm" className="p-3 bg-white border border-slate-200 rounded-md fw-semibold text-slate-900">
                {selectedEvidence.title}
              </Text>
            </div>

            {selectedEvidence.description && (
              <div>
                <Text size="xs" fw={600} className="mb-1 text-slate-800">
                  Mô tả chi tiết:
                </Text>
                <Text size="sm" className="p-3 bg-slate-50 border border-slate-200 rounded-md text-slate-700 whitespace-pre-line">
                  {selectedEvidence.description}
                </Text>
              </div>
            )}

            {(() => {
              const isUrl = selectedEvidence.fileFormat?.toLowerCase() === "url" || selectedEvidence.fileFormat?.toLowerCase() === "link"
              if (isUrl) {
                return (
                  <div className="p-3.5 border border-blue-200 rounded-xl bg-blue-50/10 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-blue-100">
                      <div className="flex items-center gap-1.5">
                        <IconLink size={16} className="text-blue-700" />
                        <Text fw={700} size="xs" className="text-blue-900">
                          Đường liên kết minh chứng:
                        </Text>
                      </div>
                      <Badge variant="light" color="blue" size="sm">
                        LIÊN KẾT
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center gap-2">
                      <Text size="xs" fw={600} className="text-blue-700 break-all bg-white/95 p-2.5 rounded-lg border border-blue-100 flex-1 select-all">
                        {selectedEvidence.urlFile}
                      </Text>
                      <Button 
                        component="a"
                        href={selectedEvidence.urlFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="xs"
                        color="blue" 
                        variant="light"
                        leftSection={<IconExternalLink size={14} />}
                      >
                        Mở liên kết
                      </Button>
                    </div>
                  </div>
                )
              }

              return (
                <div className="space-y-2">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <Text size="xs" c="dimmed">Tệp đính kèm:</Text>
                      <Badge variant="light" size="sm">{selectedEvidence.fileFormat ? selectedEvidence.fileFormat.toUpperCase() : "Không rõ"}</Badge>
                    </div>
                    <Text size="xs" fw={600} className="text-slate-800 truncate block">
                      {selectedEvidence.originalFileName || "Chưa cập nhật tên tệp tin"}
                    </Text>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1"
                        color="blue" 
                        variant="light"
                        leftSection={<IconEye size={16} />}
                        onClick={() => setShowPreview(!showPreview)}
                      >
                        {showPreview ? "Ẩn nội dung xem trước" : "Xem trực tuyến minh chứng"}
                      </Button>
                      <Button 
                        className="flex-1"
                        color="teal" 
                        variant="outline"
                        leftSection={<IconDownload size={16} />}
                        onClick={() => handleDownload(selectedEvidence.urlFile, selectedEvidence.originalFileName)}
                      >
                        Tải về máy
                      </Button>
                    </div>

                    {showPreview && (
                      <div className="mt-2 p-3 border border-slate-200 rounded-lg bg-slate-50 space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                          <Text fw={600} size="xs" className="text-slate-700">Trình xem trực tuyến:</Text>
                          <a 
                            href={selectedEvidence.urlFile} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <IconExternalLink size={12} />
                            Mở trong tab mới
                          </a>
                        </div>
                        
                        <div className="overflow-hidden flex justify-center bg-white rounded-md border border-slate-200 p-2 min-h-[250px]">
                          {(() => {
                            const getExtension = () => {
                              if (selectedEvidence.originalFileName) {
                                const parts = selectedEvidence.originalFileName.split(".")
                                if (parts.length > 1) {
                                  const extension = parts.pop()?.toLowerCase() || ""
                                  if (extension) return extension
                                }
                              }
                              const rawFormat = selectedEvidence.fileFormat ? selectedEvidence.fileFormat.toLowerCase() : ""
                              if (rawFormat.includes("/")) {
                                const subType = rawFormat.split("/")[1]
                                if (subType.includes("word") || subType.includes("document")) return "docx"
                                if (subType.includes("sheet") || subType.includes("excel") || subType === "xlsx" || subType === "xls") return "xlsx"
                                if (subType.includes("presentation") || subType.includes("powerpoint") || subType === "pptx" || subType === "ppt") return "pptx"
                                return subType
                              }
                              return rawFormat.replace(/^\./, "")
                            }
                            const ext = getExtension()
                            const url = selectedEvidence.urlFile
                            if (!url || url === "#") {
                              return <Text size="xs" c="red" className="text-center my-auto">Không tìm thấy đường dẫn tệp tin thực tế.</Text>
                            }
                            if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) {
                              return (
                                <img 
                                  src={url} 
                                  alt={selectedEvidence.title} 
                                  className="max-h-[350px] object-contain rounded" 
                                />
                              )
                            } else if (ext === "pdf") {
                              return (
                                <iframe 
                                  src={url} 
                                  title={selectedEvidence.title} 
                                  className="w-full h-[400px] border-0" 
                                />
                              )
                            } else if (["docx", "doc", "xlsx", "xls", "pptx", "ppt"].includes(ext)) {
                              return (
                                <div className="w-full space-y-2">
                                  <iframe 
                                    src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`} 
                                    title={selectedEvidence.title} 
                                    className="w-full h-[350px] border-0" 
                                  />
                                  <Text size="10px" c="dimmed" className="text-center block">
                                    Mẹo: Nếu văn bản tải chậm hoặc không hiển thị, vui lòng nhấn "Tải về máy" hoặc "Mở trong tab mới" để xem.
                                  </Text>
                                </div>
                              )
                            } else {
                              return (
                                <div className="text-center my-auto p-4 space-y-2">
                                  <IconFileText size={40} className="text-slate-400 mx-auto" />
                                  <Text size="xs" c="dimmed">Không hỗ trợ xem trước trực tiếp định dạng này ({ext.toUpperCase()}).</Text>
                                  <Button 
                                    size="xs" 
                                    variant="light" 
                                    color="blue" 
                                    onClick={() => window.open(url, "_blank")}
                                  >
                                    Mở bằng trình duyệt
                                  </Button>
                                </div>
                              )
                            }
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}

            <Textarea
              label="Nhận xét & Đánh giá của Tổ trưởng"
              placeholder="Nhập nội dung nhận xét hoặc chỉ dẫn nếu yêu cầu bổ sung..."
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.currentTarget.value)}
            />

            <div className="pt-2 flex justify-end space-x-2">
              <Button
                color="red"
                variant="light"
                leftSection={<IconAlertTriangle size={16} />}
                onClick={() => {
                  handleRequestSupplement(selectedEvidence)
                  setShowPreview(false)
                }}
              >
                Yêu Cầu Bổ Sung
              </Button>
              <Button
                color="emerald"
                leftSection={<IconCheck size={16} />}
                onClick={() => {
                  handleApprove(selectedEvidence)
                  setShowPreview(false)
                }}
              >
                Phê Duyệt Minh Chứng
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
