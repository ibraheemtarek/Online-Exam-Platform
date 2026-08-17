import type { NextFunction, Request, Response } from "express";
import { QuizController } from "./quiz.controller.js";
import { Types } from "mongoose";

describe("QuizController - getQuizDetail", () => {
  let quizService: { getQuizDetail: jest.Mock };
  let controller: QuizController;
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    quizService = {
      getQuizDetail: jest.fn(),
    };

    controller = new QuizController(quizService as any);

    req = { params: {} } as Request;

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;

    next = jest.fn() as unknown as NextFunction;
  });

  it("returns quiz detail successfully", async () => {
    const quizId = new Types.ObjectId().toString();

    const fakeQuiz = {
      id: quizId,
      title: "JavaScript Basics",
      description: "Test your JavaScript knowledge",
      instructions: "Choose the correct answer",
      durationMinutes: 30,
      passScorePercentage: 60,
      questionCount: 2,
    };

    req.params = { id: quizId };

    quizService.getQuizDetail.mockResolvedValue(fakeQuiz);

    await controller.getQuizDetail(req, res, next);

    expect(quizService.getQuizDetail).toHaveBeenCalledWith(quizId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: fakeQuiz,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next when service throws an error", async () => {
    const quizId = new Types.ObjectId().toString();
    const error = new Error("Quiz not found");

    req.params = { id: quizId };

    quizService.getQuizDetail.mockRejectedValue(error);

    await controller.getQuizDetail(req, res, next);

    expect(quizService.getQuizDetail).toHaveBeenCalledWith(quizId);
    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});