import { useState } from "react"
import {
  Title,
  Text,
  Button,
  Paper,
  Badge,
  Table,
  TextInput,
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
  IconListCheck
} from "@tabler/icons-react"
import type { User, EvidenceItem } from "../types/auth"
import { EvidenceStatus as EvidenceStatusValues } from "../types/auth"
import AppHeader from "../components/AppHeader"
import CriteriaMatrixTable from "../components/CriteriaMatrixTable"
import TeacherProgressStatsView from "../components/TeacherProgressStatsView"

interface SchoolBoardDashboardProps {
  currentUser: User
  evidences: EvidenceItem[]
  onLogout: () => void
}

export default function SchoolBoardDashboard({
  currentUser,
  evidences,
  onLogout
}: SchoolBoardDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")

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
      <AppHeader currentUser={currentUser} onLogout={onLogout} />

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
            <Tabs.Tab value="teacher_stats" leftSection={<IconChartPie size={16} />} className="font-bold text-amber-900">
              Thống Kê Tiến Độ Giáo Viên (API Backend)
            </Tabs.Tab>
            <Tabs.Tab value="matrix" leftSection={<IconTable size={16} />} className="font-bold text-blue-900">
              8 Tiêu Chuẩn & 35 Tiêu Chí (Khung Đánh Giá)
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

          <Tabs.Panel value="teacher_stats">
            <TeacherProgressStatsView />
          </Tabs.Panel>

          <Tabs.Panel value="matrix">
            <CriteriaMatrixTable evidences={evidences} />
          </Tabs.Panel>
        </Tabs>
      </main>
    </div>
  )
}
