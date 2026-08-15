/* eslint-disable no-unused-vars */
import { useState } from "react"
import {
  TextInput,
  PasswordInput,
  Checkbox,
  Button,
  Paper,
  Text,
  Title,
  Anchor,
  Badge,
  Tooltip,
  Modal,
  Alert,
  Group
} from "@mantine/core"
import { useForm } from "@mantine/form"
import {
  IconUser,
  IconLock,
  IconLogin,
  IconShieldCheck,
  IconFileUpload,
  IconSchool,
  IconCheck,
  IconHelpCircle,
  IconCertificate,
  IconSparkles,
  IconArrowRight,
  IconAlertCircle,
  IconInfoCircle
} from "@tabler/icons-react"
import { appThemeTokens } from "../theme"
import { SEED_USERS } from "../data/seedUsers"
import type { User } from "../types/auth"
import { loginWithBackend } from "../services/authApi"
// import schoolEvidenceHero from "../assets/images/school_evidence_hero.jpg"

interface LoginPageProps {
  onLoginSuccess: (_user: User) => void
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [loading, setLoading] = useState<boolean>(false)
  const [loginSuccess, setLoginSuccess] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [helpOpened, setHelpOpened] = useState<boolean>(false)
  const [forgotOpened, setForgotOpened] = useState<boolean>(false)

  const form = useForm({
    initialValues: {
      username: "",
      password: "",
      remember: true
    },

    validate: {
      username: (value) => {
        const trimmed = value.trim()
        if (trimmed.length === 0) {
          return "Vui lòng nhập email cán bộ"
        }
        if (trimmed.includes("@")) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(trimmed)) {
            return "Email không đúng định dạng (VD: ttthuedtnt@gmail.com)"
          }
        }
        return null
      },
      password: (value) =>
        value.length === 0 ? "Vui lòng nhập mật khẩu" : null
    }
  })

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true)
    setLoginSuccess(false)
    setErrorMessage(null)

    const inputEmail = values.username.trim().toLowerCase()
    const inputPassword = values.password.trim()

    // 1. Thực hiện gọi API đăng nhập tới Express Backend (/api/auth/login)
    const result = await loginWithBackend(inputEmail, inputPassword)

    if (result.success && result.user) {
      setLoading(false)
      setLoginSuccess(true)
      setTimeout(() => {
        onLoginSuccess(result.user!)
      }, 500)
    } else {
      // 2. Nếu API Backend không khả dụng hoặc trả về lỗi, fallback kiểm tra seed data
      const matchedUser = SEED_USERS.find(
        (u) => u.email.toLowerCase() === inputEmail && u.password === inputPassword
      )

      setLoading(false)
      if (matchedUser) {
        setLoginSuccess(true)
        setTimeout(() => {
          onLoginSuccess(matchedUser)
        }, 500)
      } else {
        setErrorMessage(
          result.message ||
            "Email hoặc mật khẩu không chính xác! Vui lòng kiểm tra lại."
        )
      }
    }
  }

  const fillQuickAccount = (email: string) => {
    form.setFieldValue("username", email)
    form.setFieldValue("password", "123")
    setErrorMessage(null)
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-between bg-slate-900 font-sans p-3 sm:p-6 md:p-10 selection:bg-blue-600 selection:text-white">
      {/* Background Glow Accents */}
      <div className="pointer-events-none absolute top-0 left-1/4 h-96 w-96 rounded-full bg-blue-600/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-emerald-600/10 blur-3xl" />

      {/* Main Container */}
      <div className="my-auto w-full max-w-5xl z-10">
        {/* Top Header Branding Banner */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-2 text-white">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/80 p-2 shadow-lg backdrop-blur-md border border-blue-400/30">
              <IconSchool className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="block text-xs font-semibold tracking-wider text-blue-300 uppercase">
                {appThemeTokens.schoolInfo.department}
              </span>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                {appThemeTokens.schoolInfo.schoolName}
              </h2>
            </div>
          </div>
        </div>

        {/* Paper Container Split View */}
        <Paper
          shadow="xl"
          radius="xl"
          className="grid grid-cols-1 overflow-hidden bg-white/95 backdrop-blur-xl border border-slate-200/80 md:grid-cols-12 shadow-2xl"
        >
          {/* Left Column: Visual Banner & Context Feature Area */}
          <div className="relative flex flex-col justify-between overflow-hidden bg-brand-gradient p-6 text-white md:col-span-5 md:p-8 lg:p-10">
            {/* Background Pattern Overlay */}
            <div className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Top Branding Section */}
            <div className="relative z-10">
              <div className="inline-flex items-center space-x-2 rounded-full bg-blue-500/20 px-3 py-1 border border-blue-400/30 text-xs font-semibold text-blue-200 mb-4 backdrop-blur-md">
                <IconSparkles size={14} className="text-amber-400" />
                <span>Nền tảng Minh chứng Điện tử</span>
              </div>

              <Title order={1} className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug text-white">
                Quản Lý & Lưu Trữ <br />
                <span className="text-blue-300">Minh Chứng Giáo Viên</span>
              </Title>
              <Text size="xs" className="mt-2 text-slate-300 leading-relaxed font-normal">
                Hệ thống số hóa quy trình thu thập, thẩm định và lưu trữ minh chứng chuẩn đánh giá nghề nghiệp giáo viên THPT.
              </Text>
            </div>

            {/* Center Image Container */}
            <div className="relative z-10 my-6 overflow-hidden rounded-2xl border border-white/20 shadow-xl group">
              <img
                src="../assets/images/school_evidence_hero.jpg"
                alt="Minh chứng giáo viên THPT"
                // referrerPolicy="no-referrer"
                className="h-48 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/30 to-transparent" />

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                <div className="flex items-center space-x-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                  <IconCertificate size={15} className="text-emerald-400" />
                  <span className="font-medium text-slate-100">Chuẩn Tiêu chí 2026</span>
                </div>
                <div className="flex items-center space-x-1 bg-emerald-500/80 px-2.5 py-1 rounded-lg text-[11px] font-bold">
                  <IconCheck size={13} />
                  <span>Xác thực Chữ ký số</span>
                </div>
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="relative z-10 space-y-2.5 border-t border-slate-700/50 pt-4">
              <div className="flex items-start space-x-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <IconFileUpload size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Upload Nhanh Multi-file</h4>
                  <p className="text-[11px] text-slate-300">Hỗ trợ PDF, hình ảnh scan, QĐ khen thưởng</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  <IconShieldCheck size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Bảo mật & Phân quyền Chi tiết</h4>
                  <p className="text-[11px] text-slate-300">Giáo viên, Tổ trưởng chuyên môn, Ban giám hiệu</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Login Form */}
          <div className="flex flex-col justify-between p-6 sm:p-8 md:col-span-7 lg:p-10">
            <div>
              {/* Form Title & Portal Selector */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <Badge variant="light" color="blue" size="md">
                    Cổng Đăng Nhập Chính Thức
                  </Badge>

                  <Tooltip label="Xem hướng dẫn sử dụng" position="left">
                    <Button
                      variant="subtle"
                      color="gray"
                      size="xs"
                      leftSection={<IconHelpCircle size={15} />}
                      onClick={() => setHelpOpened(true)}
                      className="text-slate-500 hover:text-blue-900"
                    >
                      Trợ giúp
                    </Button>
                  </Tooltip>
                </div>

                <Title order={2} className="mt-3 text-2xl font-bold text-slate-900 tracking-tight">
                  Đăng Nhập Hệ Thống
                </Title>
                <Text size="sm" c="dimmed" className="mt-1">
                  Nhập email cán bộ và mật khẩu của bạn để vào trang quản lý tương ứng.
                </Text>
              </div>

              {/* Login Alerts */}
              {errorMessage && (
                <Alert
                  icon={<IconAlertCircle size={18} />}
                  title="Đăng nhập không thành công"
                  color="red"
                  radius="md"
                  className="mb-4 border border-red-200"
                >
                  {errorMessage}
                </Alert>
              )}

              {loginSuccess && (
                <Alert
                  icon={<IconCheck size={18} />}
                  title="Xác thực thành công!"
                  color="emerald"
                  radius="md"
                  className="mb-4 border border-emerald-200"
                >
                  Đang chuyển hướng đến Bảng điều khiển...
                </Alert>
              )}

              {/* Login Form */}
              <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-4">
                <TextInput
                  label="Email cán bộ"
                  placeholder="Ví dụ: ttthuedtnt@gmail.com"
                  leftSection={<IconUser size={18} stroke={1.5} className="text-slate-400" />}
                  radius="md"
                  size="md"
                  required
                  {...form.getInputProps("username")}
                />

                <PasswordInput
                  label="Mật khẩu"
                  placeholder="••••••••••••"
                  leftSection={<IconLock size={18} stroke={1.5} className="text-slate-400" />}
                  radius="md"
                  size="md"
                  required
                  {...form.getInputProps("password")}
                />

                <div className="flex items-center justify-between pt-1">
                  <Checkbox
                    label="Duy trì đăng nhập trên thiết bị này"
                    color="brand"
                    size="xs"
                    {...form.getInputProps("remember", { type: "checkbox" })}
                  />
                  <Anchor
                    onClick={() => setForgotOpened(true)}
                    size="xs"
                    className="font-semibold text-blue-900 hover:text-blue-700 cursor-pointer"
                  >
                    Quên mật khẩu?
                  </Anchor>
                </div>

                {/* Submit Action Button */}
                <Button
                  type="submit"
                  fullWidth
                  size="md"
                  radius="md"
                  loading={loading}
                  color="brand"
                  className="mt-3 shadow-md hover:shadow-lg transition-all"
                  rightSection={<IconLogin size={18} />}
                >
                  {loading ? "Đang xác thực..." : "Đăng Nhập Vào Hệ Thống"}
                </Button>
              </form>

              {/* Quick Helper for Seed Users */}
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/90 p-3.5 space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700">
                  <IconInfoCircle size={15} className="text-blue-600" />
                  <span>Tài khoản mẫu từ seed.ts (Mật khẩu: 123):</span>
                </div>

                <div className="flex flex-col gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => fillQuickAccount("ttthuedtnt@gmail.com")}
                    className="flex items-center justify-between rounded-lg bg-white p-2 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-colors text-left"
                  >
                    <div>
                      <span className="font-bold text-slate-900">Tống Thị Tuyết Huệ</span>
                      <span className="text-slate-500 block text-[11px]">ttthuedtnt@gmail.com</span>
                    </div>
                    <Badge color="blue" size="xs">Giáo viên</Badge>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillQuickAccount("phuoc.ipebl@gmail.com")}
                    className="flex items-center justify-between rounded-lg bg-white p-2 border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors text-left"
                  >
                    <div>
                      <span className="font-bold text-slate-900">Lê Phú Quốc</span>
                      <span className="text-slate-500 block text-[11px]">phuoc.ipebl@gmail.com</span>
                    </div>
                    <Badge color="emerald" size="xs">Tổ trưởng</Badge>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillQuickAccount("danhsung1991@gmail.com")}
                    className="flex items-center justify-between rounded-lg bg-white p-2 border border-slate-200 hover:border-orange-400 hover:bg-orange-50/50 transition-colors text-left"
                  >
                    <div>
                      <span className="font-bold text-slate-900">Danh Sung</span>
                      <span className="text-slate-500 block text-[11px]">danhsung1991@gmail.com</span>
                    </div>
                    <Badge color="orange" size="xs">Tổ phó</Badge>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillQuickAccount("duquockiet@gmail.com")}
                    className="flex items-center justify-between rounded-lg bg-white p-2 border border-slate-200 hover:border-red-400 hover:bg-red-50/50 transition-colors text-left"
                  >
                    <div>
                      <span className="font-bold text-slate-900">Dư Quốc Kiệt</span>
                      <span className="text-slate-500 block text-[11px]">duquockiet@gmail.com</span>
                    </div>
                    <Badge color="red" size="xs">Hiệu trưởng</Badge>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillQuickAccount("ncnhuu83@gmail.com")}
                    className="flex items-center justify-between rounded-lg bg-white p-2 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors text-left"
                  >
                    <div>
                      <span className="font-bold text-slate-900">Nguyễn Chơn Nhất Hữu</span>
                      <span className="text-slate-500 block text-[11px]">ncnhuu83@gmail.com</span>
                    </div>
                    <Badge color="indigo" size="xs">Hiệu phó</Badge>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="mt-6 border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <span>© {appThemeTokens.schoolInfo.copyrightYear} {appThemeTokens.schoolInfo.schoolName}</span>
              <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-500">v1.0.0</span>
            </div>
          </div>
        </Paper>
      </div>

      {/* Modal: Hướng Dẫn */}
      <Modal
        opened={helpOpened}
        onClose={() => setHelpOpened(false)}
        title={
          <Group gap="xs">
            <IconHelpCircle className="text-blue-900" size={20} />
            <Text fw={700}>Hướng Dẫn Đăng Nhập & Nộp Minh Chứng</Text>
          </Group>
        }
        radius="lg"
        size="lg"
        centered
      >
        <div className="space-y-4 text-sm text-slate-700">
          <Alert color="blue" title="Thông tin quy chuẩn năm học 2025 - 2026">
            Hệ thống áp dụng Quy định Đánh giá chuẩn nghề nghiệp giáo viên theo Thông tư mới nhất của Bộ GD&ĐT.
          </Alert>

          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-900 text-xs">
                1
              </div>
              <div>
                <p className="font-semibold text-slate-900">Tài khoản đăng nhập</p>
                <p className="text-xs text-slate-500">Sử dụng Email công vụ trong dữ liệu seed.ts của nhà trường.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-900 text-xs">
                2
              </div>
              <div>
                <p className="font-semibold text-slate-900">Quy cách minh chứng</p>
                <p className="text-xs text-slate-500">Định dạng chấp nhận: PDF, PNG, JPG (Dung lượng tối đa 25MB/mục minh chứng).</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <Button onClick={() => setHelpOpened(false)} size="sm" radius="md">
              Đã Hiểu
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Quên Mật Khẩu */}
      <Modal
        opened={forgotOpened}
        onClose={() => setForgotOpened(false)}
        title={
          <Group gap="xs">
            <IconLock className="text-amber-600" size={20} />
            <Text fw={700}>Khôi Phục Mật Khẩu Truy Cập</Text>
          </Group>
        }
        radius="lg"
        centered
      >
        <div className="space-y-4 text-sm text-slate-700">
          <Text size="sm">
            Để đảm bảo an toàn thông tin các minh chứng sư phạm, việc khôi phục mật khẩu sẽ được gửi về Email công vụ của giáo viên.
          </Text>

          <TextInput
            label="Email công vụ nhận mã xác thực"
            placeholder="giaovien@baclieu.edu.vn"
            radius="md"
            leftSection={<IconUser size={16} />}
          />

          <div className="pt-2 flex justify-end space-x-2">
            <Button variant="default" onClick={() => setForgotOpened(false)} radius="md">
              Hủy
            </Button>
            <Button
              color="amber"
              radius="md"
              onClick={() => {
                setForgotOpened(false)
                alert("Yêu cầu đã được gửi! Vui lòng kiểm tra hộp thư email của bạn.")
              }}
              rightSection={<IconArrowRight size={16} />}
            >
              Gửi Yêu Cầu
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
