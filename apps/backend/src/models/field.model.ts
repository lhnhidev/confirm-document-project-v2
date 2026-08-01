import { Schema, model, Document, Types } from "mongoose";

export enum CriterionStatus {
  INCOMPLETE = "incomplete",
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

// Subdocument Schema cho Tiêu chí (Criterion)
export interface ICriterion {
  criteriaId: string;
  criteriaName: string;
  status: CriterionStatus | "incomplete" | "pending" | "approved" | "rejected";
}

const criterionSchema = new Schema<ICriterion>(
  {
    criteriaId: { type: String, required: true },
    criteriaName: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["incomplete", "pending", "approved", "rejected"],
      default: "incomplete",
    },
  },
  { _id: true }, // Tự động tạo _id cho từng criterion để dễ reference
);

// Main Schema cho Lĩnh vực/Tiêu chuẩn (Field)
export interface IField extends Document {
  fieldCode: string; // Tương ứng +field trong UML
  fieldName: string;
  percent: number;
  user?: Types.ObjectId; // Quan hệ với User (User "1" -> "8" Field theo cdm.pu)
  criteria: ICriterion[];
  createdAt: Date;
  updatedAt: Date;
}

const fieldSchema = new Schema<IField>(
  {
    fieldCode: { type: String, required: true, trim: true },
    fieldName: { type: String, required: true, trim: true },
    percent: { type: Number, default: 0, min: 0, max: 100 },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    criteria: [criterionSchema], // Embedded array of Criteria
  },
  { timestamps: true },
);

// Tự động tính percent = (số criteria đã duyệt / tổng số criteria) * 100
fieldSchema.pre("save", function () {
  if (this.criteria && this.criteria.length > 0) {
    const approvedCount = this.criteria.filter((c) => c.status === "approved").length;
    this.percent = Math.round((approvedCount / this.criteria.length) * 100);
  } else {
    this.percent = 0;
  }
});

export const Field = model<IField>("Field", fieldSchema);
