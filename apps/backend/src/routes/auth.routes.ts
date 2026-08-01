import { Router, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, UserRole } from "../models/user.model.ts";
import {
  authenticateToken,
  JWT_SECRET,
  type AuthRequest
} from "../middleware/auth.middleware.ts";
import { FALLBACK_USERS } from "../db/seedUsersData.ts";

const router = Router();

/**
 * POST /api/auth/login
 * Core Backend Authentication Route
 */
router.post("/login", async (req: AuthRequest, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const inputEmail = (email || username || "").trim().toLowerCase();
    const inputPassword = (password || "").trim();

    if (!inputEmail || !inputPassword) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ Email và Mật khẩu!"
      });
    }

    let foundUser: any = null;
    let isPasswordValid = false;

    // 1. Thử truy vấn từ MongoDB Atlas nếu có kết nối
    try {
      foundUser = await User.findOne({ email: inputEmail }).select("+password");
      if (foundUser && foundUser.password) {
        isPasswordValid = await bcrypt.compare(inputPassword, foundUser.password);
        // Hỗ trợ mật khẩu phẳng "123" cho seed user nếu bcrypt không match
        if (!isPasswordValid && inputPassword === foundUser.password) {
          isPasswordValid = true;
        }
      }
    } catch (dbErr) {
      console.warn("⚠️ Không thể kết nối MongoDB, chuyển sang Fallback DB In-Memory");
    }

    // 2. Nếu chưa tìm thấy hoặc MongoDB offline, kiểm tra trong In-Memory Fallback List
    if (!foundUser || !isPasswordValid) {
      const fallback = FALLBACK_USERS.find((u) => u.email.toLowerCase() === inputEmail);
      if (fallback) {
        foundUser = fallback;
        if (inputPassword === fallback.rawPassword) {
          isPasswordValid = true;
        } else {
          isPasswordValid = await bcrypt.compare(inputPassword, fallback.passwordHash);
        }
      }
    }

    if (!foundUser || !isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email công vụ hoặc mật khẩu không chính xác! Vui lòng kiểm tra lại."
      });
    }

    // 3. Chuẩn hóa thông tin User trả về
    const userPayload = {
      userId: foundUser.userId,
      fullName: foundUser.fullName,
      email: foundUser.email,
      role: foundUser.role as UserRole,
      departmentName: foundUser.departmentName || "Tổng hợp",
      major: foundUser.major || "",
      phoneNumber: foundUser.phoneNumber || ""
    };

    // 4. Khởi tạo JSON Web Token (JWT) có thời hạn 24 giờ
    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: "24h" });

    console.log(`🔑 Backend Auth: Cán bộ ${userPayload.fullName} (${userPayload.role}) đã đăng nhập thành công.`);

    return res.status(200).json({
      success: true,
      message: "Đăng nhập hệ thống thành công!",
      token,
      user: userPayload
    });
  } catch (error: any) {
    console.error("❌ Lỗi Backend Login:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi xử lý đăng nhập server!",
      error: error.message
    });
  }
});

/**
 * GET /api/auth/me
 * Kiểm tra Session & Token hiện tại của Cán bộ
 */
router.get("/me", authenticateToken, (req: AuthRequest, res: Response) => {
  return res.status(200).json({
    success: true,
    user: req.user
  });
});

/**
 * POST /api/auth/logout
 * Đăng xuất khỏi hệ thống
 */
router.post("/logout", (req: AuthRequest, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Đã đăng xuất thành công khỏi Server Backend!"
  });
});

/**
 * GET /api/auth/users
 * Lấy danh sách tài khoản mẫu (cho trợ giúp UI & Admin)
 */
router.get("/users", async (req: AuthRequest, res: Response) => {
  try {
    let users = [];
    try {
      users = await User.find().select("-password");
    } catch {
      users = [];
    }

    if (!users || users.length === 0) {
      users = FALLBACK_USERS.map(({ passwordHash, rawPassword, ...u }) => u);
    }

    return res.status(200).json({
      success: true,
      users
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
