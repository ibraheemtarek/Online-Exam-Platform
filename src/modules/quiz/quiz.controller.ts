import type { NextFunction, Request, Response } from "express";
import quizService, { type QuizService } from "./quiz.service.js";

export class QuizController{
    constructor(private readonly quizService: QuizService) {}
     async createQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const quiz = await this.quizService.createQuiz(req.body);
      res.status(201).json({ success: true, data: quiz });
    } catch (err) {
      next(err);
    }
  }
 
  async listQuizzesForAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const quizzes = await this.quizService.listQuizzesForAdmin();
      res.status(200).json({ success: true, data: quizzes });
    } catch (err) {
      next(err);
    }
  }
 
  async getQuizForAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const quiz = await this.  quizService.getQuizForAdmin(req.params.id as string);
      res.status(200).json({ success: true, data: quiz });
    } catch (err) {
      next(err);
    }
  }
 
  async updateQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const quiz = await this.quizService.updateQuiz(req.params.id as string, req.body);
      res.status(200).json({ success: true, data: quiz });
    } catch (err) {
      next(err);
    }
  }
 
  async deleteQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      await this.quizService.deleteQuiz(req.params.id as string);
      res.status(200).json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  }
 
  // Student-facing
  async listQuizzes(req: Request, res: Response, next: NextFunction) {
    try {
      const quizzes = await this.quizService.listQuizzes();
      res.status(200).json({ success: true, data: quizzes });
    } catch (err) {
      next(err);
    }
  }
 
  async getQuizDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const quiz = await this.quizService.getQuizDetail(req.params.id as string);
      res.status(200).json({ success: true, data: quiz });
    } catch (err) {
      next(err);
    }
  }

  async startQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId
      const result = await this.quizService.startQuiz(req.params.id as string, userId);
      
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async submitAttempt(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId 
      const result = await this.quizService.submitAttempt(
        req.params.attemptId as string,
        userId,
        req.body
      );
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
 
  async getResult(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId 
      const result = await this.quizService.getResult(req.params.attemptId as string, userId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId
      const review = await this.quizService.getReview(req.params.attemptId as string, userId);
      res.status(200).json({ success: true, data: review });
    } catch (err) {
      next(err);
    }
  }}

export default new QuizController(quizService);