import { Schema, model, Document, Types } from "mongoose";

export interface IAnswer {
  questionId: Types.ObjectId;
  selectedOptionIds: Types.ObjectId[];
}

export interface IQuizAttempt extends Document {
  userId: Types.ObjectId;
  quizId: Types.ObjectId;
  startTime: Date;
  submittedAt?: Date;
  status: "in_progress" | "submitted" | "expired";
  scorePercentage?: number;
  passed?: boolean;
  correctCount?: number;
  answers: IAnswer[];
  createdAt: Date;
  updatedAt: Date;
}

const answerSchema = new Schema<IAnswer>(
  {
    questionId: { type: Schema.Types.ObjectId, required: true },
    selectedOptionIds: { type: [Schema.Types.ObjectId], default: [] },
  },
  { _id: false }
);

const quizAttemptSchema = new Schema<IQuizAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    startTime: { type: Date, required: true },
    submittedAt: { type: Date },
    status: {
      type: String,
      enum: ["in_progress", "submitted", "expired"],
      default: "in_progress",
    },
    scorePercentage: { type: Number },
    passed: { type: Boolean },
    correctCount: { type: Number },
    answers: { type: [answerSchema], default: [] },
  },
  { timestamps: true }
);

quizAttemptSchema.index({ userId: 1 });
quizAttemptSchema.index({ userId: 1, quizId: 1 });

const QuizAttemptModel = model<IQuizAttempt>("QuizAttempt", quizAttemptSchema);

export default QuizAttemptModel;