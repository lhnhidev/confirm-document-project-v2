import { createTheme, type MantineColorsTuple, type MantineThemeOverride } from "@mantine/core"

// 1. Dải màu thương hiệu dành cho Hệ thống Giáo dục & Minh chứng THPT
// Màu chủ đạo: Navy / Royal Blue (Chuyên nghiệp, tin cậy, chính quy)
const brandNavy: MantineColorsTuple = [
  "#f0f4f8",
  "#dbe5f0",
  "#b6cce3",
  "#8cb0d5",
  "#6897c8",
  "#5186bf",
  "#1e40af", // Primary brand 6
  "#1d388f",
  "#0f2942", // Primary Dark 8
  "#0a1a2b"  // Primary Deep 9
]

// Màu bổ trợ: Ngọc lục bảo / Emerald (Trạng thái xác minh, thành công, minh chứng hợp lệ)
const emeraldVerified: MantineColorsTuple = [
  "#ecfdf5",
  "#d1fae5",
  "#a7f3d0",
  "#6ee7b7",
  "#34d399",
  "#10b981",
  "#059669", // Primary Emerald 6
  "#047857",
  "#065f46",
  "#064e3b"
]

// Màu cảnh báo/tiêu chuẩn: Vàng hổ phách / Amber (Chờ duyệt, bổ sung)
const amberAlert: MantineColorsTuple = [
  "#fffbe0",
  "#fef3c7",
  "#fde68a",
  "#fcd34d",
  "#fbbf24",
  "#f59e0b",
  "#d97706",
  "#b45309",
  "#92400e",
  "#78350f"
]

// 2. Cấu hình Mantine Theme
export const appMantineTheme: MantineThemeOverride = createTheme({
  primaryColor: "brand",
  primaryShade: 6,
  colors: {
    brand: brandNavy,
    emerald: emeraldVerified,
    amber: amberAlert
  },
  fontFamily: "'Be Vietnam Pro', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
  fontFamilyMonospace: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  defaultRadius: "md",
  cursorType: "pointer",
  shadows: {
    xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    sm: "0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.08)",
    md: "0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -2px rgba(15, 23, 42, 0.08)",
    lg: "0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.08)",
    xl: "0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.08)"
  },
  components: {
    Button: {
      defaultProps: {
        radius: "md",
        size: "md"
      }
    },
    TextInput: {
      defaultProps: {
        radius: "md",
        size: "md"
      }
    },
    PasswordInput: {
      defaultProps: {
        radius: "md",
        size: "md"
      }
    },
    Paper: {
      defaultProps: {
        radius: "lg",
        shadow: "md"
      }
    }
  }
})

// 3. Token giao diện tập trung (Sử dụng cho Tailwind CSS & các Custom Component)
export const appThemeTokens = {
  colors: {
    // Primary / Brand
    brandDeep: "#0a1a2b",
    brandNavy: "#0f2942",
    brandBlue: "#1e40af",
    brandAccent: "#2563eb",
    brandLight: "#f0f4f8",
    
    // Status
    success: "#059669",
    successLight: "#ecfdf5",
    warning: "#d97706",
    warningLight: "#fffbe0",
    danger: "#dc2626",
    dangerLight: "#fef2f2",
    info: "#0284c7",
    
    // Backgrounds & Neutrals
    bgCanvas: "#f8fafc",
    bgCard: "#ffffff",
    borderSubtle: "#e2e8f0",
    textPrimary: "#0f172a",
    textSecondary: "#475569",
    textMuted: "#94a3b8"
  },
  gradients: {
    brandHero: "linear-gradient(135deg, #0a1a2b 0%, #0f2942 50%, #1e40af 100%)",
    brandAccent: "linear-gradient(135deg, #1e40af 0%, #0284c7 100%)",
    goldVerified: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
    emeraldBadge: "linear-gradient(135deg, #059669 0%, #10b981 100%)"
  },
  schoolInfo: {
    title: "HỆ THỐNG QUẢN LÝ MINH CHỨNG",
    subtitle: "Xác nhận & Lưu trữ minh chứng thi đua giáo viên THPT",
    schoolName: "Trường Phổ thông Dân tộc Nội trú Tỉnh Bạc Liêu",
    department: "Sở Giáo dục & Đào tạo Tỉnh Bạc Liêu",
    copyrightYear: "2026"
  }
} as const

export type AppThemeTokens = typeof appThemeTokens
