import type { User } from "../types/auth"

const TOKEN_KEY = "confirm_docs_token_2026"
const USER_KEY = "confirm_docs_user_2026"

export interface LoginResponse {
  success: boolean
  message: string
  token?: string
  user?: User
  error?: string
}

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

/**
 * Backend API Call: Đăng nhập Cán bộ qua Express Server
 */
export async function loginWithBackend(
  emailInput: string,
  passwordInput: string
): Promise<LoginResponse> {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: emailInput.trim(),
        password: passwordInput.trim()
      })
    })

    const data = await response.json()

    if (response.ok && data.success) {
      if (data.token) {
        setToken(data.token)
      }
      if (data.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      }
      return data
    } else {
      return {
        success: false,
        message: data.message || "Email hoặc mật khẩu không chính xác!"
      }
    }
  } catch (error: unknown) {
    console.error("❌ Network or Backend connection error:", error)
    return {
      success: false,
      message: "Không thể kết nối tới Server Backend (/api/auth/login). Vui lòng thử lại!"
    }
  }
}

/**
 * Backend API Call: Kiểm tra Token & Phiên làm việc
 */
export async function verifySessionWithBackend(): Promise<User | null> {
  const token = getToken()
  if (!token) {return null}

  try {
    const response = await fetch("/api/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!response.ok) {
      removeToken()
      return null
    }

    const data = await response.json()
    if (data.success && data.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      return data.user
    }
  } catch (err) {
    console.warn("⚠️ API Verify Session error, using local fallback:", err)
  }

  // Fallback local state if offline
  try {
    const saved = localStorage.getItem(USER_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

/**
 * Backend API Call: Đăng xuất
 */
export async function logoutBackend(): Promise<void> {
  const token = getToken()
  if (token) {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    } catch {
      // ignore
    }
  }
  removeToken()
}
