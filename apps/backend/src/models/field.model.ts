import { Schema, model, Document } from "mongoose";

// Subdocument Schema cho Tiêu chí (Criterion)
export interface ICriterion {
  criteriaId: string;
  criteriaName: string;
}

const criterionSchema = new Schema<ICriterion>(
  {
    criteriaId: { type: String, required: true },
    criteriaName: { type: String, required: true, trim: true },
  },
  { _id: true }, // Tự động tạo _id cho từng criterion để dễ reference
);

// Main Schema cho Lĩnh vực/Tiêu chuẩn (Field)
export interface IField extends Document {
  fieldCode: string; // Tương ứng +field trong UML
  fieldName: string;
  percent: number;
  criteria: ICriterion[];
  createdAt: Date;
  updatedAt: Date;
}

const fieldSchema = new Schema<IField>(
  {
    fieldCode: { type: String, required: true, unique: true, trim: true },
    fieldName: { type: String, required: true, trim: true },
    percent: { type: Number, required: true, min: 0, max: 100 },
    criteria: [criterionSchema], // Embedded array of Criteria
  },
  { timestamps: true },
);

export const Field = model<IField>("Field", fieldSchema);
