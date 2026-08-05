import { useState, useEffect, useCallback, Fragment } from "react"
import { Table, Paper, Title, Text, Button, Loader, ActionIcon, Tooltip, Group, TextInput, Select } from "@mantine/core"
import { IconSparkles, IconRefresh, IconEye, IconEdit, IconTrash, IconPlus, IconFileUpload, IconSearch, IconFilter } from "@tabler/icons-react"
import { getFieldsAndCriteria, type FieldItem } from "../services/evidenceApi"
import { EvidenceStatus } from "../types/auth"
import type { EvidenceItem } from "../types/auth"

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

/* eslint-disable no-unused-vars */
type EvidenceItemHandler = (evidence: EvidenceItem) => void
type CriterionAddHandler = (standardName: string, criteriaName: string) => void
/* eslint-enable no-unused-vars */

interface CriteriaMatrixTableProps {
  evidences: EvidenceItem[]
  onViewEvidence?: EvidenceItemHandler
  onAddForCriterion?: CriterionAddHandler
  onEditEvidence?: EvidenceItemHandler
  onDeleteEvidence?: EvidenceItemHandler
}

export default function CriteriaMatrixTable({
  evidences,
  onViewEvidence,
  onAddForCriterion,
  onEditEvidence,
  onDeleteEvidence
}: CriteriaMatrixTableProps) {
  const [fields, setFields] = useState<FieldItem[]>(FRONTEND_FALLBACK_FIELDS)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const loadData = useCallback(async () => {
    setLoading(true)
    const fieldsData = await getFieldsAndCriteria()
    if (fieldsData && fieldsData.length > 0) {
      setFields(fieldsData)
    } else {
      setFields(FRONTEND_FALLBACK_FIELDS)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    let isSubscribed = true
    getFieldsAndCriteria().then((fieldsData) => {
      if (isSubscribed) {
        if (fieldsData && fieldsData.length > 0) {
          setFields(fieldsData)
        } else {
          setFields(FRONTEND_FALLBACK_FIELDS)
        }
        setLoading(false)
      }
    })
    return () => {
      isSubscribed = false
    }
  }, [evidences])

  const getMatchedEvidence = (criteriaId: string, criteriaName: string): EvidenceItem | undefined => {
    return evidences.find((e) => {
      if (!e || !e.criteriaName) {
        return false
      }
      const matchId = e.criteriaName.includes(criteriaId) || criteriaId.includes(e.criteriaName)
      const matchName =
        criteriaName.toLowerCase().includes(e.criteriaName.toLowerCase()) ||
        e.criteriaName.toLowerCase().includes(criteriaName.toLowerCase())
      return matchId || matchName
    })
  }

  // Get status of a criteria based on submitted evidences
  const getCriteriaStatus = (c: { criteriaId: string; criteriaName: string; status?: string }): "not_started" | "submitted" | "confirmed" | "completed" => {
    const matched = getMatchedEvidence(c.criteriaId, c.criteriaName)

    if (matched) {
      if (matched.currentStatus === EvidenceStatus.APPROVED) {
        return "completed"
      }
      if (matched.currentStatus === EvidenceStatus.NEEDS_SUPPLEMENT) {
        return "confirmed"
      }
      if (matched.currentStatus === EvidenceStatus.PENDING) {
        return "submitted"
      }
    }

    if (c.status === "approved" || c.status === "APPROVED") {
      return "completed"
    }
    if (c.status === "pending" || c.status === "PENDING") {
      return "submitted"
    }
    if (c.status === "rejected" || c.status === "REJECTED") {
      return "confirmed"
    }

    return "not_started"
  }

  // Dynamic calculations from DB
  const totalFields = fields.length
  const totalCriteria = fields.reduce((sum, f) => sum + (f.criteria ? f.criteria.length : 0), 0)

  // Filter the fields and their criteria
  const filteredFields = fields.map((field) => {
    if (!field.criteria) return { ...field, criteria: [] }
    
    const matchedCriteria = field.criteria.filter((c) => {
      // Search by name or code
      const query = searchQuery.trim().toLowerCase()
      const matchesQuery = !query || 
        c.criteriaName.toLowerCase().includes(query) || 
        c.criteriaId.toLowerCase().includes(query) ||
        field.fieldName.toLowerCase().includes(query) ||
        field.fieldCode.toLowerCase().includes(query)

      // Filter by status
      const status = getCriteriaStatus(c)
      const matchesStatus = statusFilter === "all" || status === statusFilter

      return matchesQuery && matchesStatus
    })

    return {
      ...field,
      criteria: matchedCriteria
    }
  }).filter((field) => field.criteria.length > 0)

  return (
    <Paper p="lg" radius="lg" className="border border-slate-200 bg-white shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200 mb-1">
            <IconSparkles size={13} />
            <span>Dữ liệu {totalFields > 0 ? totalFields : 8} Tiêu Chuẩn & {totalCriteria > 0 ? totalCriteria : 35} Tiêu Chí từ CSDL Thực Tế</span>
          </div>
          <Title order={3} className="text-xl font-bold text-slate-900 tracking-tight">
            Khung Đánh Giá Năng Lực Số Nhà Giáo ({totalFields > 0 ? totalFields : 8} Tiêu Chuẩn - {totalCriteria > 0 ? totalCriteria : 35} Tiêu Chí)
          </Title>
          <Text size="xs" c="dimmed">
            Bảng theo dõi chi tiết trạng thái đánh giá năng lực số theo từng tiêu chuẩn, tiêu chí và tỷ lệ hoàn thành lĩnh vực.
          </Text>
        </div>

        <Button
          size="xs"
          variant="outline"
          color="blue"
          leftSection={<IconRefresh size={14} />}
          onClick={loadData}
          loading={loading}
        >
          Làm mới CSDL
        </Button>
      </div>

      {/* Bộ lọc tìm kiếm minh chứng */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <TextInput
          placeholder="Tìm theo tên tiêu chí, mã tiêu chí (ví dụ: TC101, AI...)"
          label="Tìm kiếm nội dung đánh giá"
          leftSection={<IconSearch size={16} className="text-slate-400" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select
          label="Trạng thái tiêu chí"
          value={statusFilter}
          onChange={(value) => setStatusFilter(value || "all")}
          data={[
            { label: "Tất cả trạng thái", value: "all" },
            { label: "Chưa thực hiện", value: "not_started" },
            { label: "Đang chờ duyệt", value: "submitted" },
            { label: "Cần bổ sung", value: "confirmed" },
            { label: "Đã duyệt", value: "completed" },
          ]}
          leftSection={<IconFilter size={16} className="text-slate-400" />}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader color="blue" type="dots" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-300 shadow-sm">
          <Table highlightOnHover withColumnBorders verticalSpacing="sm" horizontalSpacing="md" className="text-xs">
            <Table.Thead className="bg-slate-800 text-white font-bold">
              <Table.Tr>
                <Table.Th className="w-16 text-center text-white bg-slate-900">MÃ / STT</Table.Th>
                <Table.Th className="text-white bg-slate-900">NỘI DUNG ĐÁNH GIÁ</Table.Th>
                <Table.Th className="w-[180px] text-center text-white bg-slate-900">TRẠNG THÁI TIÊU CHÍ</Table.Th>
                <Table.Th className="w-[200px] text-center text-white bg-slate-900">THAO TÁC</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {filteredFields.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={4} className="text-center py-12 text-slate-500 bg-slate-50/50">
                    <div className="flex flex-col items-center justify-center gap-2 py-4">
                      <IconSearch size={36} className="text-slate-400" />
                      <Text fw={700} size="sm" className="text-slate-700">Không tìm thấy nội dung đánh giá phù hợp</Text>
                      <Text size="xs" c="dimmed">Vui lòng thử lại với từ khóa hoặc trạng thái khác</Text>
                      {(searchQuery || statusFilter !== "all") && (
                        <Button 
                          size="xs" 
                          variant="subtle" 
                          color="blue"
                          onClick={() => {
                            setSearchQuery("")
                            setStatusFilter("all")
                          }}
                          className="mt-2"
                        >
                          Xóa bộ lọc
                        </Button>
                      )}
                    </div>
                  </Table.Td>
                </Table.Tr>
              ) : (
                filteredFields.map((field) => {
                  const originalField = fields.find((f) => f.fieldCode === field.fieldCode)
                  const fieldTotalCriteria = originalField?.criteria ? originalField.criteria.length : 0
                  let fieldCompletedCount = 0

                if (field.criteria) {
                  field.criteria.forEach((c) => {
                    if (getCriteriaStatus(c) === "completed") {
                      fieldCompletedCount++
                    }
                  })
                }

                const fieldPercent = fieldTotalCriteria > 0 ? Math.round((fieldCompletedCount / fieldTotalCriteria) * 100) : 0

                return (
                  <Fragment key={field.fieldCode}>
                    {/* Field Row */}
                    <Table.Tr className="bg-blue-100/80 font-extrabold text-blue-950 text-sm border-t-2 border-blue-200">
                      <Table.Td className="text-center font-extrabold text-blue-900">{field.fieldCode}</Table.Td>
                      <Table.Td className="uppercase font-extrabold tracking-wide text-blue-950" colSpan={3}>
                        {field.fieldName}
                      </Table.Td>
                    </Table.Tr>

                    {/* Criteria Rows */}
                    {field.criteria && field.criteria.map((c) => {
                      const status = getCriteriaStatus(c)
                      const matchedEvidence = getMatchedEvidence(c.criteriaId, c.criteriaName)

                      return (
                        <Table.Tr key={c.criteriaId} className="hover:bg-blue-50/40 transition-colors">
                          <Table.Td className="text-center font-mono text-slate-600 font-semibold bg-slate-50/50">
                            {c.criteriaId}
                          </Table.Td>

                          <Table.Td>
                            <span className="font-bold text-red-600 mr-1.5">{c.criteriaId}.</span>
                            <span className="text-slate-800 font-medium">{c.criteriaName}</span>
                          </Table.Td>

                          <Table.Td className="text-center">
                            {status === "not_started" && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
                                Chưa thực hiện
                              </span>
                            )}
                            {status === "submitted" && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
                                Đang chờ duyệt
                              </span>
                            )}
                            {status === "confirmed" && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-orange-50 text-orange-800 border border-orange-300">
                                Cần bổ sung
                              </span>
                            )}
                            {status === "completed" && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
                                Đã duyệt
                              </span>
                            )}
                          </Table.Td>

                          <Table.Td className="text-center">
                            <Group gap="xs" justify="center">
                              {/* 1. Chưa thực hiện */}
                              {status === "not_started" && (
                                <Button
                                  size="xs"
                                  color="emerald"
                                  variant="light"
                                  leftSection={<IconPlus size={13} />}
                                  onClick={() => onAddForCriterion?.(field.fieldName, c.criteriaName)}
                                >
                                  Nộp minh chứng
                                </Button>
                              )}

                              {/* 2. Chờ duyệt */}
                              {status === "submitted" && (
                                <>
                                  {matchedEvidence && (
                                    <Tooltip label="Xem minh chứng">
                                      <ActionIcon
                                        variant="light"
                                        color="blue"
                                        size="sm"
                                        onClick={() => onViewEvidence?.(matchedEvidence)}
                                      >
                                        <IconEye size={15} />
                                      </ActionIcon>
                                    </Tooltip>
                                  )}
                                  {matchedEvidence && (
                                    <Tooltip label="Chỉnh sửa minh chứng">
                                      <ActionIcon
                                        variant="light"
                                        color="amber"
                                        size="sm"
                                        onClick={() => onEditEvidence?.(matchedEvidence)}
                                      >
                                        <IconEdit size={15} />
                                      </ActionIcon>
                                    </Tooltip>
                                  )}
                                  {matchedEvidence && (
                                    <Tooltip label="Xóa minh chứng">
                                      <ActionIcon
                                        variant="light"
                                        color="red"
                                        size="sm"
                                        onClick={() => onDeleteEvidence?.(matchedEvidence)}
                                      >
                                        <IconTrash size={15} />
                                      </ActionIcon>
                                    </Tooltip>
                                  )}
                                </>
                              )}

                              {/* 3. Cần bổ sung */}
                              {status === "confirmed" && (
                                <>
                                  {matchedEvidence && (
                                    <Tooltip label="Xem minh chứng">
                                      <ActionIcon
                                        variant="light"
                                        color="blue"
                                        size="sm"
                                        onClick={() => onViewEvidence?.(matchedEvidence)}
                                      >
                                        <IconEye size={15} />
                                      </ActionIcon>
                                    </Tooltip>
                                  )}
                                  <Button
                                    size="xs"
                                    color="orange"
                                    variant="light"
                                    leftSection={<IconFileUpload size={13} />}
                                    onClick={() => {
                                      if (matchedEvidence) {
                                        onEditEvidence?.(matchedEvidence)
                                      } else {
                                        onAddForCriterion?.(field.fieldName, c.criteriaName)
                                      }
                                    }}
                                  >
                                    Bổ sung
                                  </Button>
                                </>
                              )}

                              {/* 4. Đã duyệt */}
                              {status === "completed" && (
                                <>
                                  {matchedEvidence ? (
                                    <Tooltip label="Xem minh chứng">
                                      <ActionIcon
                                        variant="light"
                                        color="blue"
                                        size="sm"
                                        onClick={() => onViewEvidence?.(matchedEvidence)}
                                      >
                                        <IconEye size={15} />
                                      </ActionIcon>
                                    </Tooltip>
                                  ) : (
                                    <Button
                                      size="xs"
                                      variant="subtle"
                                      color="blue"
                                      leftSection={<IconEye size={13} />}
                                      onClick={() => onAddForCriterion?.(field.fieldName, c.criteriaName)}
                                    >
                                      Xem
                                    </Button>
                                  )}
                                </>
                              )}
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      )
                    })}

                    {/* Field Result Summary Row (KQ LV) */}
                    <Table.Tr className="bg-slate-100/90 font-bold text-slate-900 border-b-2 border-slate-300 text-xs">
                      <Table.Td className="text-center font-extrabold text-blue-900 bg-slate-200/80">
                        KQ LV {field.fieldCode}
                      </Table.Td>
                      <Table.Td className="font-bold text-slate-800">
                        Kết quả đánh giá Lĩnh vực {field.fieldCode}: <span className="font-semibold text-slate-600">{field.fieldName}</span>
                      </Table.Td>
                      <Table.Td className="text-center" colSpan={2}>
                        <div className="inline-flex items-center justify-center space-x-2 bg-emerald-50 text-emerald-900 px-3 py-1 rounded-md border border-emerald-300 font-bold text-xs shadow-2xs">
                          <span>Hoàn thành/Tổng: {fieldCompletedCount}/{fieldTotalCriteria} tiêu chí ({fieldPercent}%)</span>
                        </div>
                      </Table.Td>
                    </Table.Tr>
                  </Fragment>
                )
              })
            )}
            </Table.Tbody>
          </Table>
        </div>
      )}
    </Paper>
  )
}

