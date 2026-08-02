import { Schema, model, Document, Types } from "mongoose";

export enum UserRole {
  TEACHER = "Teacher",
  DEPARTMENT_HEAD = "DepartmentHead",
  SCHOOL_BOARD = "SchoolBoard",
}

export interface IUser extends Document {
  userId: string;
  fullName: string;
  role: UserRole;
  major: string;
  email: string;
  phoneNumber?: string;
  departmentName?: string;
  password: string;
  rawPassword?: string;
  fields?: Types.ObjectId[]; // Ref -> Field (Quan hệ 1 - 8 với Field theo cdm.pu)
  evidences?: Types.ObjectId[]; // Ref -> Evidence (Quan hệ 1 - n với Evidence)
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    userId: { type: String, unique: true, sparse: true },
    fullName: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.TEACHER,
      required: true,
    },
    major: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: { type: String, trim: true },
    departmentName: { type: String, trim: true },
    password: { type: String, required: true, select: false }, // Hide password by default
    rawPassword: { type: String, trim: true, select: false },
    fields: [{ type: Schema.Types.ObjectId, ref: "Field" }],
    evidences: [{ type: Schema.Types.ObjectId, ref: "Evidence" }],
  },
  { timestamps: true },
);

export const User = model<IUser>("User", userSchema);
