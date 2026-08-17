import { z } from "zod";

const optionInputSchema = z.object({
  text: z.string().trim().min(1, "Option text is required"),
  isCorrect: z.boolean(),
});

const questionInputSchema = z
  .object({
    text: z.string().trim().min(1, "Question text is required"),
    type: z.enum(["single", "multi"]),
    points: z.number().int().positive(),
    options: z.array(optionInputSchema).min(2, "At least 2 options required"),
  })
  .superRefine((question, ctx) => {
    const correctCount = question.options.filter((o) => o.isCorrect).length;

    if (question.type === "single" && correctCount !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Single-choice questions must have exactly 1 correct option",
        path: ["options"],
      });
    }

    if (question.type === "multi" && correctCount < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Multi-choice questions must have at least 1 correct option",
        path: ["options"],
      });
    }
  });

export const createQuizSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1),
  instructions: z.string().trim().min(1),
  durationMinutes: z.number().int().positive().max(300),
  passScorePercentage: z.number().min(0).max(100),
  questions: z.array(questionInputSchema).min(1, "Quiz must have at least 1 question"),
  isPublished: z.boolean().optional().default(false),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;

export const updateQuizSchema = createQuizSchema.partial();
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;

export const submitAttemptSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1, "questionId is required"),
        selectedOptionIds: z.array(z.string()).default([]),
      })
    )
    .min(1, "At least one answer is required"),
});

export type SubmitAttemptInput = z.infer<typeof submitAttemptSchema>;