import { useState } from "react"
import { Text, Avatar, Badge, Button, Menu, UnstyledButton } from "@mantine/core"
import { IconSchool, IconLogout, IconUserCheck, IconChevronDown, IconBell, IconUser } from "@tabler/icons-react"
import type { User, UserRole } from "../types/auth"
import { UserRole as UserRoleValues } from "../types/auth"
import { appThemeTokens } from "../theme"
import UserProfileModal from "./UserProfileModal"

interface AppHeaderProps {
  currentUser: User
  onLogout: () => void
  // eslint-disable-next-line no-unused-vars
  onUserUpdate?: (_user: User) => void
}

export default function AppHeader({ currentUser, onLogout, onUserUpdate }: AppHeaderProps) {
  const [profileModalOpened, setProfileModalOpened] = useState(false)

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
    case UserRoleValues.TEACHER:
      return {
        label: "Giáo viên THPT",
        color: "blue"
      }
    case UserRoleValues.DEPARTMENT_HEAD:
      return {
        label: "Tổ trưởng Chuyên môn",
        color: "emerald"
      }
    case UserRoleValues.SCHOOL_BOARD:
      return {
        label: "Ban Giám Hiệu",
        color: "amber"
      }
    default:
      return {
        label: role,
        color: "gray"
      }
    }
  }

  const roleInfo = getRoleBadge(currentUser.role)

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left Branding */}
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 p-2 shadow-md">
              <IconSchool className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm font-bold tracking-tight text-white sm:text-base">
                  {appThemeTokens.schoolInfo.title}
                </h1>
                <span className="hidden md:inline-block rounded-md bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-300 border border-blue-400/30">
                  THPT
                </span>
              </div>
              <p className="hidden sm:block text-xs text-slate-400">
                {appThemeTokens.schoolInfo.schoolName}
              </p>
            </div>
          </div>

          {/* Right User Bar */}
          <div className="flex items-center space-x-3">
            {/* Notification bell badge */}
            <button className="relative rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
              <IconBell size={20} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
            </button>

            {/* User Menu */}
            <Menu shadow="md" width={260} position="bottom-end">
              <Menu.Target>
                <UnstyledButton className="flex items-center space-x-3 rounded-xl p-1.5 hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700">
                  <Avatar color="blue" radius="xl" size="md" className="font-bold">
                    {currentUser.fullName.split(" ").slice(-1)[0][0]}
                  </Avatar>

                  <div className="hidden sm:block text-left">
                    <div className="flex items-center space-x-1.5">
                      <Text size="sm" fw={600} className="text-white leading-tight">
                        {currentUser.fullName}
                      </Text>
                    </div>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <Badge size="xs" color={roleInfo.color} variant="filled">
                        {roleInfo.label}
                      </Badge>
                      <Text size="xs" className="text-slate-400 text-[11px]">
                        • {currentUser.departmentName || "Tổng hợp"}
                      </Text>
                    </div>
                  </div>

                  <IconChevronDown size={16} className="text-slate-400" />
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown className="bg-white border-slate-200 text-slate-900 shadow-xl">
                <Menu.Label className="text-slate-500 font-semibold">Tài khoản cán bộ</Menu.Label>
                <Menu.Item
                  leftSection={<IconUserCheck size={18} className="text-blue-600" />}
                  className="hover:bg-slate-100 cursor-default"
                >
                  <div className="py-0.5">
                    <Text size="xs" fw={700} className="text-black">{currentUser.fullName}</Text>
                    <Text size="xs" className="text-black font-medium">{currentUser.email}</Text>
                    <Text size="xs" className="text-slate-800 font-medium mt-0.5">Môn: {currentUser.major || "Chưa cập nhật"}</Text>
                  </div>
                </Menu.Item>

                <Menu.Divider className="border-slate-200" />

                <Menu.Item
                  leftSection={<IconUser size={18} className="text-emerald-600" />}
                  onClick={() => setProfileModalOpened(true)}
                  className="hover:bg-slate-100 font-medium text-slate-800"
                >
                  Thông tin cá nhân
                </Menu.Item>

                <Menu.Divider className="border-slate-200" />

                <Menu.Item
                  color="red"
                  leftSection={<IconLogout size={18} />}
                  onClick={onLogout}
                  className="hover:bg-red-50 font-medium text-red-600"
                >
                  Đăng Xuất
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            <Button
              variant="outline"
              color="red"
              size="xs"
              leftSection={<IconLogout size={14} />}
              onClick={onLogout}
              className="hidden lg:flex border-red-500/40 text-red-300 hover:bg-red-500/10"
            >
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      {/* User Profile Modal */}
      <UserProfileModal
        opened={profileModalOpened}
        onClose={() => setProfileModalOpened(false)}
        currentUser={currentUser}
        onUserUpdate={onUserUpdate}
      />
    </>
  )
}
