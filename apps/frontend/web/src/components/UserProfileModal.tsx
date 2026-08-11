import { useState } from "react"
import {
  Modal,
  Text,
  Badge,
  Button,
  TextInput,
  Group,
  Stack,
  Avatar,
  Card,
  Alert,
  Divider,
  ActionIcon
} from "@mantine/core"
import {
  IconUser,
  IconMail,
  IconPhone,
  IconSchool,
  IconId,
  IconBuildingSkyscraper,
  IconCheck,
  IconAlertCircle,
  IconEdit,
  IconShieldCheck,
  IconKey,
  IconEye,
  IconEyeOff
} from "@tabler/icons-react"
import type { User, UserRole } from "../types/auth"
import { UserRole as UserRoleValues } from "../types/auth"
import { updateProfileApi, changePasswordApi } from "../services/authApi"

interface UserProfileModalProps {
  opened: boolean
  onClose: () => void
  currentUser: User
  // eslint-disable-next-line no-unused-vars
  onUserUpdate?: (_user: User) => void
}

export default function UserProfileModal({
  opened,
  onClose,
  currentUser,
  onUserUpdate
}: UserProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [fullName, setFullName] = useState(currentUser.fullName)
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phoneNumber || "")
  const [major, setMajor] = useState(currentUser.major)
  const [departmentName, setDepartmentName] = useState(currentUser.departmentName || "Tổng hợp")
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const [showPassword, setShowPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleStartEdit = () => {
    setFullName(currentUser.fullName)
    setPhoneNumber(currentUser.phoneNumber || "")
    setMajor(currentUser.major)
    setDepartmentName(currentUser.departmentName || "Tổng hợp")
    setFeedback(null)
    setIsEditing(true)
    setIsChangingPassword(false)
  }

  const handleModalClose = () => {
    setIsEditing(false)
    setIsChangingPassword(false)
    setFeedback(null)
    onClose()
  }

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
    case UserRoleValues.TEACHER:
      return { label: "Giáo viên THPT", color: "blue" }
    case UserRoleValues.DEPARTMENT_HEAD:
      return { label: "Tổ trưởng Chuyên môn", color: "emerald" }
    case UserRoleValues.DEPARTMENT_VICE_HEAD:
      return { label: "Tổ phó Chuyên môn", color: "orange" }
    case UserRoleValues.PRINCIPAL:
      return { label: "Hiệu trưởng", color: "red" }
    case UserRoleValues.VICE_PRINCIPAL:
      return { label: "Hiệu phó", color: "indigo" }
    case UserRoleValues.SCHOOL_BOARD:
      return { label: "Ban Giám Hiệu", color: "amber" }
    default:
      return { label: role, color: "gray" }
    }
  }

  const roleInfo = getRoleLabel(currentUser.role)

  const handleSave = async () => {
    setSaving(true)
    setFeedback(null)

    const res = await updateProfileApi({
      fullName,
      phoneNumber,
      major,
      departmentName
    })

    setSaving(false)

    if (res.success && res.user) {
      setFeedback({
        type: "success",
        message: res.message || "Cập nhật thông tin cá nhân thành công!"
      })
      if (onUserUpdate) {
        onUserUpdate(res.user)
      }
      setIsEditing(false)
    } else {
      setFeedback({
        type: "error",
        message: res.message || "Có lỗi xảy ra khi cập nhật thông tin!"
      })
    }
  }

  const handleChangePassword = async () => {
    setFeedback(null)
    if (!currentPassword || !newPassword || !confirmPassword) {
      setFeedback({ type: "error", message: "Vui lòng nhập đầy đủ các trường mật khẩu!" })
      return
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ type: "error", message: "Mật khẩu mới và xác nhận mật khẩu mới không khớp!" })
      return
    }

    setSaving(true)
    const res = await changePasswordApi({ currentPassword, newPassword })
    setSaving(false)

    if (res.success) {
      setFeedback({ type: "success", message: res.message || "Đổi mật khẩu thành công!" })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setIsChangingPassword(false)
    } else {
      setFeedback({ type: "error", message: res.message || "Đổi mật khẩu thất bại!" })
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={handleModalClose}
      title={
        <Group gap="xs">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold">
            <IconUser size={18} />
          </div>
          <div>
            <Text fw={700} size="md" className="text-slate-900">
              Thông Tin Cá Nhân Cán Bộ
            </Text>
            <Text size="xs" c="dimmed">
              Dữ liệu tài khoản trong Cơ sở dữ liệu trường THPT
            </Text>
          </div>
        </Group>
      }
      size="lg"
      radius="md"
      centered
    >
      <Stack gap="md" className="py-2">
        {feedback && (
          <Alert
            color={feedback.type === "success" ? "emerald" : "red"}
            icon={feedback.type === "success" ? <IconCheck size={18} /> : <IconAlertCircle size={18} />}
            title={feedback.type === "success" ? "Thành công" : "Thông báo lỗi"}
            withCloseButton
            onClose={() => setFeedback(null)}
          >
            {feedback.message}
          </Alert>
        )}

        {/* User Card Header */}
        <Card padding="md" radius="md" className="bg-gradient-to-r from-slate-900 to-blue-950 text-white shadow-sm">
          <Group justify="between" align="center">
            <Group gap="md">
              <Avatar color="blue" radius="xl" size="lg" className="font-bold border-2 border-blue-400">
                {currentUser.fullName.split(" ").slice(-1)[0][0]}
              </Avatar>
              <div>
                <Text fw={700} size="lg" className="text-white">
                  {currentUser.fullName}
                </Text>
                <Group gap="xs" className="mt-1">
                  <Badge color={roleInfo.color} variant="filled" size="sm">
                    {roleInfo.label}
                  </Badge>
                  <Badge color="gray" variant="light" size="sm">
                    {currentUser.departmentName || "Tổng hợp"}
                  </Badge>
                </Group>
              </div>
            </Group>

            <Badge variant="outline" color="blue" size="sm" leftSection={<IconShieldCheck size={14} />}>
              Cán bộ chính thức
            </Badge>
          </Group>
        </Card>

        {!isEditing && !isChangingPassword ? (
          <>
            {/* Database Details Grid */}
            <Card padding="md" radius="md" className="border border-slate-200 bg-slate-50/60">
              <Text fw={700} size="xs" className="uppercase tracking-wider text-slate-500 mb-3">
                Chi tiết dữ liệu hồ sơ (Database Record)
              </Text>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Group gap="xs">
                    <IconId size={18} className="text-blue-600" />
                    <div>
                      <Text size="xs" c="dimmed">Mã số cán bộ</Text>
                      <Text size="sm" fw={700} className="text-slate-900 font-mono">
                        {currentUser.userId}
                      </Text>
                    </div>
                  </Group>
                </div>

                <div>
                  <Group gap="xs">
                    <IconMail size={18} className="text-blue-600" />
                    <div>
                      <Text size="xs" c="dimmed">Email công vụ</Text>
                      <Text size="sm" fw={600} className="text-slate-900">
                        {currentUser.email}
                      </Text>
                    </div>
                  </Group>
                </div>

                <div>
                  <Group gap="xs">
                    <IconKey size={18} className="text-amber-600" />
                    <div className="flex-1">
                      <Text size="xs" c="dimmed">Mật khẩu tài khoản</Text>
                      <Group gap="xs" align="center">
                        <Text size="sm" fw={600} className="text-slate-900 font-mono">
                          {showPassword ? (currentUser.rawPassword || "123") : "••••••"}
                        </Text>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                          title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        >
                          {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                        </ActionIcon>
                      </Group>
                    </div>
                  </Group>
                </div>

                <div>
                  <Group gap="xs">
                    <IconSchool size={18} className="text-blue-600" />
                    <div>
                      <Text size="xs" c="dimmed">Bộ môn giảng dạy</Text>
                      <Text size="sm" fw={600} className="text-slate-900">
                        {currentUser.major || "Chưa cập nhật"}
                      </Text>
                    </div>
                  </Group>
                </div>

                <div>
                  <Group gap="xs">
                    <IconBuildingSkyscraper size={18} className="text-blue-600" />
                    <div>
                      <Text size="xs" c="dimmed">Tổ chuyên môn</Text>
                      <Text size="sm" fw={600} className="text-slate-900">
                        {currentUser.departmentName || "Tổng hợp"}
                      </Text>
                    </div>
                  </Group>
                </div>

                <div>
                  <Group gap="xs">
                    <IconPhone size={18} className="text-blue-600" />
                    <div>
                      <Text size="xs" c="dimmed">Số điện thoại liên hệ</Text>
                      <Text size="sm" fw={600} className="text-slate-900">
                        {currentUser.phoneNumber || "Chưa cập nhật"}
                      </Text>
                    </div>
                  </Group>
                </div>

                <div>
                  <Group gap="xs">
                    <IconShieldCheck size={18} className="text-emerald-600" />
                    <div>
                      <Text size="xs" c="dimmed">Trạng thái tài khoản</Text>
                      <Text size="sm" fw={600} className="text-emerald-700">
                        Đang hoạt động (MongoDB Atlas)
                      </Text>
                    </div>
                  </Group>
                </div>
              </div>
            </Card>

            <Group justify="end" className="pt-2">
              <Button
                variant="light"
                color="blue"
                leftSection={<IconEdit size={16} />}
                onClick={handleStartEdit}
              >
                Chỉnh sửa thông tin
              </Button>
              <Button
                variant="light"
                color="amber"
                leftSection={<IconKey size={16} />}
                onClick={() => {
                  setIsChangingPassword(true)
                  setFeedback(null)
                  setCurrentPassword("")
                  setNewPassword("")
                  setConfirmPassword("")
                }}
              >
                Đổi mật khẩu
              </Button>
              <Button variant="outline" color="gray" onClick={handleModalClose}>
                Đóng
              </Button>
            </Group>
          </>
        ) : isChangingPassword ? (
          /* Change Password Form */
          <Stack gap="sm">
            <Card padding="md" radius="md" className="border border-amber-200 bg-amber-50/30">
              <Text fw={700} size="xs" className="uppercase tracking-wider text-amber-900 mb-3">
                Thay đổi mật khẩu tài khoản
              </Text>

              <Stack gap="xs">
                <TextInput
                  label="Mật khẩu hiện tại"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại..."
                  required
                  rightSection={
                    <ActionIcon variant="subtle" color="gray" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                      {showCurrentPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                    </ActionIcon>
                  }
                />

                <TextInput
                  label="Mật khẩu mới"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới..."
                  required
                  rightSection={
                    <ActionIcon variant="subtle" color="gray" onClick={() => setShowNewPassword(!showNewPassword)}>
                      {showNewPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                    </ActionIcon>
                  }
                />

                <TextInput
                  label="Xác nhận mật khẩu mới"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới..."
                  required
                  rightSection={
                    <ActionIcon variant="subtle" color="gray" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                    </ActionIcon>
                  }
                />
              </Stack>
            </Card>

            <Divider className="my-1" />

            <Group justify="end">
              <Button
                variant="subtle"
                color="gray"
                onClick={() => setIsChangingPassword(false)}
                disabled={saving}
              >
                Hủy bỏ
              </Button>
              <Button
                color="amber"
                leftSection={<IconCheck size={16} />}
                loading={saving}
                onClick={handleChangePassword}
              >
                Xác nhận đổi mật khẩu
              </Button>
            </Group>
          </Stack>
        ) : (
          /* Editing Form */
          <Stack gap="sm">
            <Card padding="md" radius="md" className="border border-blue-200 bg-blue-50/30">
              <Text fw={700} size="xs" className="uppercase tracking-wider text-blue-900 mb-3">
                Cập nhật thông tin cán bộ
              </Text>

              <Stack gap="xs">
                <TextInput
                  label="Mã cán bộ (ID)"
                  value={currentUser.userId}
                  disabled
                  description="Mã cố định được cấp bởi BGH"
                />

                <TextInput
                  label="Email công vụ"
                  value={currentUser.email}
                  disabled
                  description="Email định danh hệ thống"
                />

                <TextInput
                  label="Họ và tên cán bộ"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ và tên đầy đủ..."
                  required
                />

                <TextInput
                  label="Bộ môn giảng dạy"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="Ví dụ: Tin học, Giáo dục Quốc phòng, Toán..."
                  required
                  disabled={currentUser.role === UserRoleValues.TEACHER}
                  description={currentUser.role === UserRoleValues.TEACHER ? "Chỉ Tổ trưởng hoặc BGH mới có quyền thay đổi bộ môn giảng dạy" : undefined}
                />

                <TextInput
                  label="Tổ chuyên môn"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  placeholder="Ví dụ: Tổ Xã Hội, Tổ Tự Nhiên, Tổng hợp..."
                  disabled={currentUser.role === UserRoleValues.TEACHER}
                  description={currentUser.role === UserRoleValues.TEACHER ? "Chỉ Tổ trưởng hoặc BGH mới có quyền thay đổi tổ chuyên môn" : undefined}
                />

                <TextInput
                  label="Số điện thoại liên hệ"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Nhập số điện thoại..."
                />
              </Stack>
            </Card>

            <Divider className="my-1" />

            <Group justify="end">
              <Button
                variant="subtle"
                color="gray"
                onClick={() => setIsEditing(false)}
                disabled={saving}
              >
                Hủy bỏ
              </Button>
              <Button
                color="blue"
                leftSection={<IconCheck size={16} />}
                loading={saving}
                onClick={handleSave}
              >
                Lưu thay đổi
              </Button>
            </Group>
          </Stack>
        )}
      </Stack>
    </Modal>
  )
}
