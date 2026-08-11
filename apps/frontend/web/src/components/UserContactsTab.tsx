import { useState, useEffect, useMemo } from "react"
import {
  Table,
  TextInput,
  Pagination,
  Paper,
  Text,
  Avatar,
  Badge,
  Group,
  Stack,
  Loader,
  Center,
  ActionIcon,
  Button,
  Tooltip
} from "@mantine/core"
import { IconSearch, IconRefresh, IconX, IconMessageCircle } from "@tabler/icons-react"
import { getUsersApi } from "../services/authApi"
import type { User, UserRole } from "../types/auth"

const ROLE_LABELS: Record<UserRole, string> = {
  Teacher: "Giáo viên",
  DepartmentHead: "Tổ trưởng chuyên môn",
  DepartmentViceHead: "Tổ phó chuyên môn",
  Principal: "Hiệu trưởng",
  VicePrincipal: "Hiệu phó",
  SchoolBoard: "Ban giám hiệu"
}

const ROLE_COLORS: Record<UserRole, string> = {
  Teacher: "blue",
  DepartmentHead: "amber",
  DepartmentViceHead: "orange",
  Principal: "red",
  VicePrincipal: "indigo",
  SchoolBoard: "emerald"
}

export default function UserContactsTab() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [activePage, setActivePage] = useState<number>(1)

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getUsersApi()
      if (res.success && res.users) {
        setUsers(res.users)
      } else {
        setError("Không thể tải danh sách người dùng từ máy chủ.")
      }
    } catch (err) {
      console.error(err)
      setError("Lỗi kết nối đến máy chủ.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setTimeout(() => {
      fetchUsers()
    }, 0)
  }, [])

  // Filter users based on search query (email, họ tên, môn dạy, tổ)
  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) {
      return users
    }

    return users.filter((u) => {
      const nameMatch = u.fullName ? u.fullName.toLowerCase().includes(query) : false
      const emailMatch = u.email ? u.email.toLowerCase().includes(query) : false
      const majorMatch = u.major ? u.major.toLowerCase().includes(query) : false
      const deptMatch = u.departmentName ? u.departmentName.toLowerCase().includes(query) : false
      return nameMatch || emailMatch || majorMatch || deptMatch
    })
  }, [users, searchQuery])

  // Reset page when search changes
  useEffect(() => {
    setTimeout(() => {
      setActivePage(1)
    }, 0)
  }, [searchQuery])

  // Pagination config: 10 users per page
  const itemsPerPage = 10
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage))
  
  const paginatedUsers = useMemo(() => {
    const start = (activePage - 1) * itemsPerPage
    return filteredUsers.slice(start, start + itemsPerPage)
  }, [filteredUsers, activePage])

  // Helper to get initials
  const getInitials = (name: string) => {
    if (!name) {
      return "?"
    }
    const parts = name.trim().split(" ")
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <Paper p="lg" radius="lg" className="border border-slate-200 bg-white shadow-sm space-y-4">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            Danh Bạ Người Dùng Hệ Thống
          </h3>
          <Text size="xs" c="dimmed">
            Danh sách tất cả tài khoản trong hệ thống quản lý minh chứng đánh giá chuẩn nghề nghiệp giáo viên THPT.
          </Text>
        </div>

        <Group gap="xs" className="w-full sm:w-auto">
          <TextInput
            placeholder="Tìm theo họ tên, email, môn dạy, tổ..."
            size="sm"
            radius="md"
            className="w-full sm:w-80"
            leftSection={<IconSearch size={16} className="text-slate-400" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            rightSection={
              searchQuery ? (
                <ActionIcon size="xs" variant="transparent" onClick={() => setSearchQuery("")}>
                  <IconX size={14} className="text-slate-400" />
                </ActionIcon>
              ) : null
            }
          />
          <ActionIcon 
            variant="light" 
            color="blue" 
            size="lg" 
            radius="md"
            onClick={fetchUsers}
            loading={loading}
            title="Tải lại danh sách"
          >
            <IconRefresh size={18} />
          </ActionIcon>
        </Group>
      </div>

      {loading ? (
        <Center className="py-12">
          <Stack align="center" gap="xs">
            <Loader size="md" />
            <Text size="sm" c="dimmed">Đang tải danh sách người dùng...</Text>
          </Stack>
        </Center>
      ) : error && users.length === 0 ? (
        <Center className="py-12 border border-dashed border-red-200 rounded-lg bg-red-50/50">
          <Stack align="center" gap="xs">
            <Text size="sm" c="red" className="font-semibold">{error}</Text>
            <Button size="xs" variant="outline" color="red" onClick={fetchUsers}>Thử lại</Button>
          </Stack>
        </Center>
      ) : filteredUsers.length === 0 ? (
        <Center className="py-12 border border-dashed border-slate-200 rounded-lg bg-slate-50">
          <Text size="sm" c="dimmed">Không tìm thấy người dùng nào phù hợp với từ khóa tìm kiếm.</Text>
        </Center>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead className="bg-slate-50 text-slate-700">
                <Table.Tr>
                  <Table.Th>Người Dùng</Table.Th>
                  <Table.Th>Chức Vụ</Table.Th>
                  <Table.Th>Môn Học Giảng Dạy</Table.Th>
                  <Table.Th>Tổ Chuyên Môn</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Số Điện Thoại</Table.Th>
                  <Table.Th>Zalo</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {paginatedUsers.map((user) => (
                  <Table.Tr key={user.userId}>
                    <Table.Td>
                      <Group gap="sm">
                        <Avatar 
                          color="blue" 
                          radius="xl" 
                          size="md"
                          className="font-bold text-sm bg-blue-50 text-blue-700"
                        >
                          {getInitials(user.fullName)}
                        </Avatar>
                        <div>
                          <Text size="sm" fw={700} className="text-slate-900">
                            {user.fullName}
                          </Text>
                          <Text size="xs" c="dimmed">
                            ID: {user.userId}
                          </Text>
                        </div>
                      </Group>
                    </Table.Td>
                    
                    <Table.Td>
                      <Badge 
                        color={ROLE_COLORS[user.role] || "gray"} 
                        variant="light"
                        size="sm"
                      >
                        {ROLE_LABELS[user.role] || user.role}
                      </Badge>
                    </Table.Td>

                    <Table.Td>
                      <Text size="sm" className="text-slate-700 font-medium">
                        {user.major || "Không có"}
                      </Text>
                    </Table.Td>

                    <Table.Td>
                      <Text size="sm" className="text-slate-600">
                        {user.departmentName || "Chưa phân tổ"}
                      </Text>
                    </Table.Td>

                    <Table.Td>
                      <Tooltip label={`Gửi email đến: ${user.email}`} position="top" withArrow>
                        <Text 
                          size="sm" 
                          className="text-blue-600 hover:text-blue-800 cursor-pointer underline"
                          component="a"
                          href={`mailto:${user.email}`}
                        >
                          {user.email}
                        </Text>
                      </Tooltip>
                    </Table.Td>

                    <Table.Td>
                      {user.phoneNumber ? (
                        <Text 
                          size="sm" 
                          className="text-blue-600 underline font-semibold cursor-pointer hover:text-blue-800"
                          component="a"
                          href={`tel:${user.phoneNumber}`}
                        >
                          {user.phoneNumber}
                        </Text>
                      ) : (
                        <Text size="sm" c="dimmed" className="italic">
                          Chưa cập nhật
                        </Text>
                      )}
                    </Table.Td>

                    <Table.Td>
                      {user.phoneNumber ? (
                        <Tooltip label={`Nhắn tin Zalo: ${user.phoneNumber}`} position="top" withArrow>
                          <ActionIcon
                            component="a"
                            href={`https://zalo.me/${user.phoneNumber.replace(/\s+/g, "").replace(/\./g, "").replace(/-/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="light"
                            color="blue"
                            radius="md"
                            size="md"
                          >
                            <IconMessageCircle size={16} />
                          </ActionIcon>
                        </Tooltip>
                      ) : (
                        <Text size="xs" c="dimmed" className="italic">
                          N/A
                        </Text>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <Text size="xs" c="dimmed">
                Hiển thị {Math.min(filteredUsers.length, (activePage - 1) * itemsPerPage + 1)} - {Math.min(filteredUsers.length, activePage * itemsPerPage)} trong tổng số {filteredUsers.length} người dùng
              </Text>
              <Pagination 
                value={activePage} 
                onChange={setActivePage} 
                total={totalPages} 
                size="sm" 
                radius="md" 
                color="blue"
              />
            </div>
          )}
        </div>
      )}
    </Paper>
  )
}
