import { useState, useEffect } from "react"
import LoginPage from "./pages/LoginPage"
import TeacherDashboard from "./pages/TeacherDashboard"
import DepartmentHeadDashboard from "./pages/DepartmentHeadDashboard"
import SchoolBoardDashboard from "./pages/SchoolBoardDashboard"
import type { User, EvidenceItem, EvidenceStatus } from "./types/auth"
import { UserRole } from "./types/auth"
import { INITIAL_EVIDENCES } from "./data/mockEvidences"
import { verifySessionWithBackend, logoutBackend, getToken } from "./services/authApi"
import { fetchEvidencesApi, submitEvidenceApi, updateEvidenceStatusApi } from "./services/evidenceApi"

const AUTH_STORAGE_KEY = "confirm_docs_user_2026"

const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [evidences, setEvidences] = useState<EvidenceItem[]>(INITIAL_EVIDENCES)

  // Load evidences & verify backend session on startup
  useEffect(() => {
    const initBackend = async () => {
      const token = getToken()
      if (token) {
        const verifiedUser = await verifySessionWithBackend()
        if (verifiedUser) {
          setCurrentUser(verifiedUser)
        }
      }

      // Fetch evidences from backend
      const backendEvidences = await fetchEvidencesApi()
      if (backendEvidences && backendEvidences.length > 0) {
        setEvidences(backendEvidences)
      }
    }
    initBackend()
  }, [])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser))
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  }, [currentUser])

  const handleLoginSuccess = async (user: User) => {
    setCurrentUser(user)
    const backendEvidences = await fetchEvidencesApi()
    if (backendEvidences && backendEvidences.length > 0) {
      setEvidences(backendEvidences)
    }
  }

  const handleLogout = async () => {
    await logoutBackend()
    setCurrentUser(null)
  }

  const handleAddEvidence = async (
    newEv: Omit<EvidenceItem, "id" | "evidenceId" | "submittedBy">
  ) => {
    if (!currentUser) return

    // Call Backend API
    const apiResult = await submitEvidenceApi(newEv)
    if (apiResult) {
      setEvidences((prev) => [apiResult, ...prev])
    } else {
      // Fallback local addition if offline
      const newId = `EV-${String(evidences.length + 1).padStart(3, "0")}`
      const newEvidenceId = `MC-2026-${String(evidences.length + 1).padStart(3, "0")}`

      const createdItem: EvidenceItem = {
        ...newEv,
        id: newId,
        evidenceId: newEvidenceId,
        submittedBy: {
          userId: currentUser.userId,
          fullName: currentUser.fullName,
          email: currentUser.email,
          departmentName: currentUser.departmentName || "Tổng hợp"
        }
      }
      setEvidences((prev) => [createdItem, ...prev])
    }
  }

  const handleUpdateStatus = async (
    id: string,
    status: EvidenceStatus,
    comment?: string
  ) => {
    await updateEvidenceStatusApi(id, status, comment)
    setEvidences((prev) =>
      prev.map((item) =>
        item.id === id || item.evidenceId === id
          ? {
              ...item,
              currentStatus: status,
              reviewComment: comment || item.reviewComment
            }
          : item
      )
    )
  }

  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  switch (currentUser.role) {
    case UserRole.TEACHER:
      return (
        <TeacherDashboard
          currentUser={currentUser}
          evidences={evidences}
          onAddEvidence={handleAddEvidence}
          onLogout={handleLogout}
        />
      )

    case UserRole.DEPARTMENT_HEAD:
      return (
        <DepartmentHeadDashboard
          currentUser={currentUser}
          evidences={evidences}
          onUpdateStatus={handleUpdateStatus}
          onLogout={handleLogout}
        />
      )

    case UserRole.SCHOOL_BOARD:
      return (
        <SchoolBoardDashboard
          currentUser={currentUser}
          evidences={evidences}
          onLogout={handleLogout}
        />
      )

    default:
      return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }
}

export default App
