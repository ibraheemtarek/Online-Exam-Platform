import { Types } from "mongoose";
import { QuizService } from "./quiz.service.js";

describe("QuizService - getQuizDetail", () => {
  const quizModel = {
    findOne: jest.fn(),
  };

  const quizAttemptModel = {};

  const service = new QuizService(
    quizModel as any,
    quizAttemptModel as any
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the quiz when it exists", async () => {
    const quizId = new Types.ObjectId().toString();

    const fakeQuiz = {
      _id: quizId,
      title: "JavaScript Basics",
      description: "Test your JavaScript knowledge",
      instructions: "Choose the correct answer",
      durationMinutes: 30,
      passScorePercentage: 60,
      questions: [
        {
          _id: new Types.ObjectId(),
          text: "What is JavaScript?",
          type: "single",
          points: 5,
          options: [],
        },
        {
          _id: new Types.ObjectId(),
          text: "What is TypeScript?",
          type: "single",
          points: 5,
          options: [],
        },
      ],
    };

    quizModel.findOne.mockResolvedValue(fakeQuiz);

    const result = await service.getQuizDetail(quizId);

    expect(result).toEqual({
      id: quizId,
      title: "JavaScript Basics",
      description: "Test your JavaScript knowledge",
      instructions: "Choose the correct answer",
      durationMinutes: 30,
      passScorePercentage: 60,
      questionCount: 2,
    });

    expect(quizModel.findOne).toHaveBeenCalledWith({
      _id: quizId,
      isPublished: true,
    });
  });

  it("throws an error when the quiz does not exist", async () => {
    const quizId = new Types.ObjectId().toString();

    quizModel.findOne.mockResolvedValue(null);

    await expect(
      service.getQuizDetail(quizId)
    ).rejects.toThrow("Quiz not found");

    expect(quizModel.findOne).toHaveBeenCalledWith({
      _id: quizId,
      isPublished: true,
    });
  });
});