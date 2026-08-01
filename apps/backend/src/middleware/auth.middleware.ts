import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../models/user.model.ts";

export const JWT_SECRET = process.env.JWT_SECRET || "confirm_documents_jwt_secret_key_2026";

export interface AuthenticatedUser {
  userId: string;
  fullName: string;
  email: string;
  role: UserRole;
  major?: string;
  departmentName?: string;
  phoneNumber?: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Không tìm thấy token xác thực! Vui lòng đăng nhập lại."
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Token xác thực không hợp lệ hoặc đã hết hạn!"
    });
  }
};

export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Chưa được xác thực!"
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập vào chức năng này!"
      });
    }

    next();
  };
};
