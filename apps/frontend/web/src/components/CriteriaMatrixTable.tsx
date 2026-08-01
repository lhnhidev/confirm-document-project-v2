import { useState, useEffect, useCallback } from "react"
import { Table, Paper, Title, Text, Button, Loader } from "@mantine/core"
import { IconSparkles, IconRefresh } from "@tabler/icons-react"
import { getFieldsAndCriteria, type FieldItem } from "../services/evidenceApi"
import { EvidenceStatus } from "../types/auth"
import type { EvidenceItem } from "../types/auth"

interface CriteriaMatrixTableProps {
  evidences: EvidenceItem[]
}

export default function CriteriaMatrixTable({ evidences }: CriteriaMatrixTableProps) {
  const [fields, setFields] = useState<FieldItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    const fieldsData = await getFieldsAndCriteria()
    setFields(fieldsData)
    setLoading(false)
  }, [])

  useEffect(() => {
    let isSubscribed = true
    getFieldsAndCriteria().then((fieldsData) => {
      if (isSubscribed) {
        setFields(fieldsData)
        setLoading(false)
      }
    })
    return () => {
      isSubscribed = false
    }
  }, [evidences])

  // Get status of a criteria based on submitted evidences
  const getCriteriaStatus = (criteriaId: string, criteriaName: string): "not_started" | "submitted" | "confirmed" | "completed" => {
    const matched = evidences.filter((e) => {
      if (!e.criteriaName) {
        return false
      }
      const matchId = e.criteriaName.includes(criteriaId) || criteriaId.includes(e.criteriaName)
      const matchName =
        criteriaName.toLowerCase().includes(e.criteriaName.toLowerCase()) ||
        e.criteriaName.toLowerCase().includes(criteriaName.toLowerCase())
      return matchId || matchName
    })

    if (matched.length === 0) {
      return "not_started"
    }

    if (matched.some((e) => e.currentStatus === EvidenceStatus.APPROVED)) {
      return "completed"
    }

    if (matched.some((e) => e.currentStatus === EvidenceStatus.NEEDS_SUPPLEMENT)) {
      return "confirmed"
    }

    if (matched.some((e) => e.currentStatus === EvidenceStatus.PENDING)) {
      return "submitted"
    }

    return "not_started"
  }

  // Dynamic calculations from DB
  const totalFields = fields.length
  const totalCriteria = fields.reduce((sum, f) => sum + (f.criteria ? f.criteria.length : 0), 0)

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
                <Table.Th className="w-[420px] text-center text-white bg-slate-900">TRẠNG THÁI TIÊU CHÍ</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {fields.map((field) => {
                const fieldTotalCriteria = field.criteria ? field.criteria.length : 0
                let fieldCompletedCount = 0

                if (field.criteria) {
                  field.criteria.forEach((c) => {
                    if (getCriteriaStatus(c.criteriaId, c.criteriaName) === "completed") {
                      fieldCompletedCount++
                    }
                  })
                }

                const fieldPercent = fieldTotalCriteria > 0 ? Math.round((fieldCompletedCount / fieldTotalCriteria) * 100) : 0

                return (
                  <div key={field.fieldCode} style={{ display: "contents" }}>
                    {/* Field Row */}
                    <Table.Tr className="bg-blue-100/80 font-extrabold text-blue-950 text-sm border-t-2 border-blue-200">
                      <Table.Td className="text-center font-extrabold text-blue-900">{field.fieldCode}</Table.Td>
                      <Table.Td className="uppercase font-extrabold tracking-wide text-blue-950" colSpan={2}>
                        {field.fieldName}
                      </Table.Td>
                    </Table.Tr>

                    {/* Criteria Rows */}
                    {field.criteria && field.criteria.map((c) => {
                      const status = getCriteriaStatus(c.criteriaId, c.criteriaName)

                      return (
                        <Table.Tr key={c.criteriaId} className="hover:bg-blue-50/40 transition-colors">
                          <Table.Td className="text-center font-mono text-slate-600 font-semibold bg-slate-50/50">
                            {c.criteriaId}
                          </Table.Td>

                          <Table.Td>
                            <span className="font-bold text-red-600 mr-1.5">{c.criteriaId}.</span>
                            <span className="text-slate-800 font-medium">{c.criteriaName}</span>
                          </Table.Td>

                          <Table.Td>
                            <div className="flex items-center justify-around gap-1 text-[11px]">
                              <label className={`inline-flex items-center space-x-1 cursor-default px-1.5 py-0.5 rounded transition-colors ${
                                status === "not_started"
                                  ? "font-bold text-slate-900 bg-slate-200/90 border border-slate-300"
                                  : "text-slate-400"
                              }`}>
                                <input type="checkbox" checked={status === "not_started"} readOnly className="h-3 w-3 text-slate-600 rounded-sm" />
                                <span>Chưa thực hiện</span>
                              </label>

                              <label className={`inline-flex items-center space-x-1 cursor-default px-1.5 py-0.5 rounded transition-colors ${
                                status === "submitted"
                                  ? "font-bold text-amber-900 bg-amber-100 border border-amber-300"
                                  : "text-slate-400"
                              }`}>
                                <input type="checkbox" checked={status === "submitted"} readOnly className="h-3 w-3 text-amber-600 rounded-sm" />
                                <span>Đã nộp</span>
                              </label>

                              <label className={`inline-flex items-center space-x-1 cursor-default px-1.5 py-0.5 rounded transition-colors ${
                                status === "confirmed"
                                  ? "font-bold text-blue-900 bg-blue-100 border border-blue-300"
                                  : "text-slate-400"
                              }`}>
                                <input type="checkbox" checked={status === "confirmed"} readOnly className="h-3 w-3 text-blue-600 rounded-sm" />
                                <span>Đã xác nhận</span>
                              </label>

                              <label className={`inline-flex items-center space-x-1 cursor-default px-1.5 py-0.5 rounded transition-colors ${
                                status === "completed"
                                  ? "font-bold text-emerald-900 bg-emerald-100 border border-emerald-300"
                                  : "text-slate-400"
                              }`}>
                                <input type="checkbox" checked={status === "completed"} readOnly className="h-3 w-3 text-emerald-600 rounded-sm" />
                                <span>Hoàn thành</span>
                              </label>
                            </div>
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
                      <Table.Td className="text-center">
                        <div className="inline-flex items-center justify-center space-x-2 bg-emerald-50 text-emerald-900 px-3 py-1 rounded-md border border-emerald-300 font-bold text-xs shadow-2xs">
                          <span>Hoàn thành/Tổng: {fieldCompletedCount}/{fieldTotalCriteria} tiêu chí ({fieldPercent}%)</span>
                        </div>
                      </Table.Td>
                    </Table.Tr>
                  </div>
                )
              })}
            </Table.Tbody>
          </Table>
        </div>
      )}
    </Paper>
  )
}

