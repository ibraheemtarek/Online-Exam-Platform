import { Model, Types } from "mongoose";
import QuizModel, { type IQuiz } from "./quiz.model.js"
import QuizAttemptModel, { type IQuizAttempt } from "./quizAttempt.model.js";
// import { SubmitAttemptInput } from "./quiz.dto";
import CustomError from "../../common/errors/custom.error.js";
import type { CreateQuizInput, SubmitAttemptInput, UpdateQuizInput } from "./quiz.dto.js";
import { calculateScore } from "./utils/score-calculator.js";

export class QuizService {

    constructor(
        private readonly _quizModel: Model<IQuiz>,
        private readonly _quizAttemptModel: Model<IQuizAttempt>
    ) {}

  async createQuiz(input: CreateQuizInput) {
    const quiz = new this._quizModel(input);
    await quiz.save();
    return quiz; // full doc, isCorrect included — this is an admin response
  }
 
  async listQuizzesForAdmin() {
    return this._quizModel.find().sort({ createdAt: -1 }).lean();
  }
 
  async getQuizForAdmin(quizId: string) {
    const quiz = await this._quizModel.findById(quizId);
    if (!quiz) throw new CustomError("Quiz not found", 404);
    return quiz; // includes isCorrect on every option, deliberately
  }
 
  async updateQuiz(quizId: string, input: UpdateQuizInput) {
    const quiz = await this._quizModel.findById(quizId);
    if (!quiz) throw new CustomError("Quiz not found", 404);
 
    if (input.questions) {
      const hasAttempts = await this._quizAttemptModel.exists({ quizId });
      if (hasAttempts) {
        throw new CustomError(
          "Cannot edit questions on a quiz that already has attempts",
          409
        );
      }
    }
 
    Object.assign(quiz, input);
    await quiz.save();
    return quiz;
  }
 
  async deleteQuiz(quizId: string) {
    const hasAttempts = await this._quizAttemptModel.exists({ quizId });
    if (hasAttempts) {
      throw new CustomError("Cannot delete a quiz that already has attempts", 409);
    }
 
    const quiz = await this._quizModel.findByIdAndDelete(quizId);
    if (!quiz) throw new CustomError("Quiz not found", 404);
    return quiz;
  }


  async listQuizzes(page:number = 0, limit:number = 10) {
    
    const skip = (page-1) * limit;
    
    const [quizzes, total] = await Promise.all([
      this._quizModel.find({ isPublished: true }).select(
        "title description durationMinutes passScorePercentage questions"
      )
      .skip(skip)
      .limit(limit),
      
      this._quizModel.countDocuments({ isPublished: true })
    ])
  
    return { quizzes: quizzes.map((q) => ({
      id: q._id,
      title: q.title,
      description: q.description,
      durationMinutes: q.durationMinutes,
      passScorePercentage: q.passScorePercentage,
      questionCount: q.questions.length,
    })), pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1, 
    }};
  }

  async getQuizDetail(quizId: string) {
    const quiz = await this._quizModel.findOne({ _id: quizId, isPublished: true });
    if (!quiz) throw new CustomError("Quiz not found", 404);

    return {
      id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      instructions: quiz.instructions,
      durationMinutes: quiz.durationMinutes,
      passScorePercentage: quiz.passScorePercentage,
      questionCount: quiz.questions.length,
    };
  }

  async startQuiz(quizId: string, userId: string) {
    const quiz = await this._quizModel.findOne({ _id: quizId, isPublished: true });
    if (!quiz) throw new CustomError("Quiz not found", 404);

    const attempt = await this._quizAttemptModel.create({
      userId,
      quizId,
      startTime: new Date(),
      status: "in_progress",
    });

    return {
      attemptId: attempt._id,
      startTime: attempt.startTime,
      durationMinutes: quiz.durationMinutes,
      title: quiz.title,
      questions: quiz.questions.map((q) => ({
        id: q._id,
        text: q.text,
        type: q.type,
        options: q.options.map((o) => ({ id: o._id, text: o.text })),
      })),
    };
  }

  async submitAttempt(attemptId: string, userId: string, input: SubmitAttemptInput) {
    const attempt = await this._quizAttemptModel.findById(attemptId);
    if (!attempt) throw new CustomError("Attempt not found", 404);
    if (attempt.userId.toString() !== userId) {
      throw new CustomError("Not your attempt", 403);
    }
    if (attempt.status !== "in_progress") {
      throw new CustomError("Attempt already submitted", 409);
    }

    const quiz = await this._quizModel.findById(attempt.quizId);
    if (!quiz) throw new CustomError("Quiz not found", 404);

    const now = new Date();
    const maxAllowedTime = new Date(
      attempt.startTime.getTime() + (quiz.durationMinutes * 60 + 10) * 1000
    );

    const persistedAnswers = input.answers.map((a) => ({
      questionId: new Types.ObjectId(a.questionId),
      selectedOptionIds: a.selectedOptionIds.map((id) => new Types.ObjectId(id)),
    }));

    if (now > maxAllowedTime) {
      attempt.status = "expired";
      attempt.submittedAt = now;
      attempt.scorePercentage = 0;
      attempt.passed = false;
      attempt.correctCount = 0;
      attempt.answers = persistedAnswers;
      await attempt.save();
      throw new CustomError("Quiz submission expired (timer exceeded)", 400);
    }

    const { scorePercentage, correctCount } = calculateScore(quiz.questions, input.answers);

    attempt.status = "submitted";
    attempt.submittedAt = now;
    attempt.scorePercentage = scorePercentage;
    attempt.passed = scorePercentage >= quiz.passScorePercentage;
    attempt.correctCount = correctCount;
    attempt.answers = persistedAnswers;
    await attempt.save();

    return {
      scorePercentage: attempt.scorePercentage,
      passed: attempt.passed,
      correctCount: attempt.correctCount,
      timeSpentSeconds: Math.round((now.getTime() - attempt.startTime.getTime()) / 1000),
    };
  }

  async getResult(attemptId: string, userId: string) {
    const attempt = await this._quizAttemptModel.findById(attemptId);
    if (!attempt) throw new CustomError("Attempt not found", 404);
    if (attempt.userId.toString() !== userId) {
      throw new CustomError("Not your attempt", 403);
    }
    if (attempt.status === "in_progress") {
      throw new CustomError("Attempt not yet submitted", 400);
    }

    return {
      scorePercentage: attempt.scorePercentage,
      passed: attempt.passed,
      correctCount: attempt.correctCount,
      timeSpentSeconds: attempt.submittedAt
        ? Math.round((attempt.submittedAt.getTime() - attempt.startTime.getTime()) / 1000)
        : null,
    };
  }

  async getReview(attemptId: string, userId: string) {
    const attempt = await this._quizAttemptModel.findById(attemptId);
    if (!attempt) throw new CustomError("Attempt not found", 404);
    if (attempt.userId.toString() !== userId) {
      throw new CustomError("Not your attempt", 403);
    }
    if (attempt.status === "in_progress") {
      throw new CustomError("Attempt not yet submitted", 400);
    }

    const quiz = await this._quizModel.findById(attempt.quizId);
    if (!quiz) throw new CustomError("Quiz not found", 404);

    const answersByQuestionId = new Map(
      attempt.answers.map((a) => [a.questionId.toString(), a.selectedOptionIds.map(String)])
    );

    return quiz.questions.map((question) => {
      const selectedOptionIds = answersByQuestionId.get(question._id.toString()) ?? [];
      const correctOptionIds = question.options
        .filter((o) => o.isCorrect)
        .map((o) => o._id.toString());

      const sortedSelected = [...selectedOptionIds].sort();
      const sortedCorrect = [...correctOptionIds].sort();
      const isCorrect =
        sortedSelected.length === sortedCorrect.length &&
        sortedSelected.every((id, i) => id === sortedCorrect[i]);

      return {
        questionId: question._id,
        text: question.text,
        options: question.options.map((o) => ({ id: o._id, text: o.text })),
        selectedOptionIds,
        correctOptionIds,
        isCorrect,
      };
    });
  }
};

export default new QuizService(QuizModel, QuizAttemptModel);