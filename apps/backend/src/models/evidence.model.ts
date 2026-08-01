import { Schema, model, Document, Types } from "mongoose";

export enum EvidenceStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected",
  NEEDS_SUPPLEMENT = "NeedsSupplement",
}

export interface IEvidence extends Document {
  evidenceId: string;
  title: string;
  description?: string;
  date: Date;
  originalFileName: string;
  fileFormat: string;
  fileSize: number; // Tương ứng Long (tính bằng bytes)
  urlFile: string;
  currentStatus: EvidenceStatus;

  // Relations
  submittedBy: Types.ObjectId; // FK -> User
  fieldId: Types.ObjectId; // FK -> Field
  criterionId: Types.ObjectId; // Ref đến _id của Criterion nằm trong Field

  createdAt: Date;
  updatedAt: Date;
}

const evidenceSchema = new Schema<IEvidence>(
  {
    evidenceId: { type: String, unique: true, sparse: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    date: { type: Date, default: Date.now },
    originalFileName: { type: String, required: true },
    fileFormat: { type: String, required: true },
    fileSize: { type: Number, required: true },
    urlFile: { type: String, required: true },
    currentStatus: {
      type: String,
      enum: Object.values(EvidenceStatus),
      default: EvidenceStatus.PENDING,
      required: true,
    },
    // Khóa ngoại liên kết
    submittedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fieldId: { type: Schema.Types.ObjectId, ref: "Field", required: true },
    criterionId: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true },
);

export const Evidence = model<IEvidence>("Evidence", evidenceSchema);
