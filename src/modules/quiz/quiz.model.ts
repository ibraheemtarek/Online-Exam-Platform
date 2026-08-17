// modules/quiz/quiz.model.ts
import { Schema, model, Document, Types } from "mongoose";

export interface IOption {
  _id: Types.ObjectId;
  text: string;
  isCorrect: boolean;
}

export interface IQuestion {
  _id: Types.ObjectId;
  text: string;
  type: "single" | "multi";
  points: number;
  options: IOption[];
}

export interface IQuiz extends Document {
  title: string;
  description: string;
  instructions: string;
  durationMinutes: number;
  passScorePercentage: number;
  questions: IQuestion[];
  createdBy: Types.ObjectId;
  isPublished: boolean;
}

const optionSchema = new Schema<IOption>({
  text: { type: String, required: true, trim: true },
  isCorrect: { type: Boolean, required: true, default: false },
});

const questionSchema = new Schema<IQuestion>({
  text: { type: String, required: true, trim: true },
  type: { type: String, enum: ["single", "multi"], required: true },
  points: { type: Number, required: true, min: 1 },
  options: {
    type: [optionSchema],
    validate: {
      validator: (opts: IOption[]) => opts.length >= 2,
      message: "A question must have at least 2 options",
    },
  },
});

const quizSchema = new Schema<IQuiz>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    instructions: { type: String, required: true },
    durationMinutes: { type: Number, required: true, min: 1 },
    passScorePercentage: { type: Number, required: true, min: 0, max: 100 },
    questions: { type: [questionSchema], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const QuizModel = model<IQuiz>("Quiz", quizSchema);

export default QuizModel;