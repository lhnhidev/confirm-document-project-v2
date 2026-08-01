import { useState, useEffect, useCallback } from "react"
import { Paper, Title, Text, Table, Badge, Progress, Button, Loader, Avatar, Group } from "@mantine/core"
import { IconRefresh } from "@tabler/icons-react"
import { getEvidenceStats, type StatsResponse } from "../services/evidenceApi"

export default function TeacherProgressStatsView() {
  const [statsData, setStatsData] = useState<StatsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const loadStats = useCallback(async () => {
    setLoading(true)
    const res = await getEvidenceStats()
    setStatsData(res)
    setLoading(false)
  }, [])

  useEffect(() => {
    let isSubscribed = true
    getEvidenceStats().then((res) => {
      if (isSubscribed) {
        setStatsData(res)
        setLoading(false)
      }
    })
    return () => {
      isSubscribed = false
    }
  }, [])

  return (
    <Paper p="lg" radius="lg" className="border border-slate-200 bg-white shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <Title order={3} className="text-xl font-bold text-slate-900 tracking-tight">
            Thống Kê Tiến Độ Hoàn Thành Tiêu Chí Của Giáo Viên (API Backend)
          </Title>
          <Text size="xs" c="dimmed">
            Dữ liệu tổng hợp từ Express Backend Server: Tổng minh chứng đã nộp, đã duyệt, chờ thẩm định, và tiến độ tiêu chí (35 tiêu chí).
          </Text>
        </div>

        <Button
          size="xs"
          variant="outline"
          color="blue"
          leftSection={<IconRefresh size={14} />}
          onClick={loadStats}
          loading={loading}
        >
          Cập nhật API
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader color="blue" type="dots" />
        </div>
      ) : !statsData ? (
        <Text size="sm" c="dimmed" className="py-4 text-center">
          Chưa thể lấy dữ liệu thống kê từ Server Backend (/api/evidences/stats).
        </Text>
      ) : (
        <div className="space-y-6">
          {/* Summary Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <Text size="xs" c="dimmed" fw={600}>TỔNG MINH CHỨNG NỘP</Text>
              <Text size="lg" fw={800} className="text-blue-900">{statsData.summary.totalSubmitted}</Text>
            </div>
            <div>
              <Text size="xs" c="dimmed" fw={600}>ĐÃ PHÊ DUYỆT</Text>
              <Text size="lg" fw={800} className="text-emerald-600">{statsData.summary.totalApproved}</Text>
            </div>
            <div>
              <Text size="xs" c="dimmed" fw={600}>CHỜ THẨM ĐỊNH</Text>
              <Text size="lg" fw={800} className="text-amber-600">{statsData.summary.totalPending}</Text>
            </div>
            <div>
              <Text size="xs" c="dimmed" fw={600}>CẦN BỔ SUNG</Text>
              <Text size="lg" fw={800} className="text-red-600">{statsData.summary.totalNeedsSupplement}</Text>
            </div>
          </div>

          {/* Teacher Progress Table */}
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead className="bg-slate-100 text-slate-700">
                <Table.Tr>
                  <Table.Th>Họ và Tên Giáo Viên</Table.Th>
                  <Table.Th>Tổ Chuyên Môn</Table.Th>
                  <Table.Th className="text-center">Số Hồ Sơ Đã Nộp</Table.Th>
                  <Table.Th className="text-center">Đã Duyệt</Table.Th>
                  <Table.Th className="text-center">Chờ Duyệt</Table.Th>
                  <Table.Th>Tiến Độ Hoàn Thành Tiêu Chí</Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {statsData.teacherProgress.map((teacher, idx) => (
                  <Table.Tr key={idx}>
                    <Table.Td>
                      <Group gap="sm">
                        <Avatar color="blue" radius="xl" size="sm">
                          {teacher.fullName.split(" ").slice(-1)[0][0]}
                        </Avatar>
                        <div>
                          <Text size="xs" fw={700} className="text-slate-900">
                            {teacher.fullName}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {teacher.email}
                          </Text>
                        </div>
                      </Group>
                    </Table.Td>

                    <Table.Td>
                      <Badge variant="light" color="blue" size="xs">
                        {teacher.departmentName}
                      </Badge>
                    </Table.Td>

                    <Table.Td className="text-center font-bold text-slate-800">
                      {teacher.totalSubmitted}
                    </Table.Td>

                    <Table.Td className="text-center font-bold text-emerald-600">
                      {teacher.approved}
                    </Table.Td>

                    <Table.Td className="text-center font-bold text-amber-600">
                      {teacher.pending}
                    </Table.Td>

                    <Table.Td className="w-56">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-slate-700">
                            {teacher.completedCriteriaCount} / {teacher.totalCriteriaCount} tiêu chí
                          </span>
                          <span className="font-bold text-blue-900">{teacher.completionPercentage}%</span>
                        </div>
                        <Progress value={teacher.completionPercentage} color="blue" radius="xl" size="sm" />
                      </div>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </div>
        </div>
      )}
    </Paper>
  )
}
