import { Router } from "express";
import QuizController from "./quiz.controller.js";
import { isAuth } from "../../common/middlewares/auth.token.js";
import { UserRole } from "../auth/auth.dto.js";

const quizRouter = Router();

//  Admin Routes 

quizRouter.post("/admin", isAuth(UserRole.ADMIN),QuizController.createQuiz.bind(QuizController));

quizRouter.get("/admin",isAuth(UserRole.ADMIN), QuizController.listQuizzesForAdmin.bind(QuizController));

quizRouter.get("/admin/:id", isAuth(UserRole.ADMIN), QuizController.getQuizForAdmin.bind(QuizController));

quizRouter.put("/admin/:id", isAuth(UserRole.ADMIN), QuizController.updateQuiz.bind(QuizController));

quizRouter.delete("/admin/:id", isAuth(UserRole.ADMIN), QuizController.deleteQuiz.bind(QuizController));

//  Student/User Routes 

quizRouter.get("/", QuizController.listQuizzes.bind(QuizController));

quizRouter.get("/:id", QuizController.getQuizDetail.bind(QuizController));

quizRouter.post("/:id/start",isAuth(), QuizController.startQuiz.bind(QuizController));

quizRouter.post("/attempts/:attemptId/submit", isAuth(), QuizController.submitAttempt.bind(QuizController));

quizRouter.get("/attempts/:attemptId/result", isAuth(), QuizController.getResult.bind(QuizController));

quizRouter.get("/attempts/:attemptId/review", isAuth(), QuizController.getReview.bind(QuizController));

export default quizRouter;