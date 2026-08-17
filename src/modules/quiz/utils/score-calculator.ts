import { type IQuestion }  from "../quiz.model.js";

export interface SubmittedAnswer {
  questionId: string;
  selectedOptionIds: string[];
}

/** Scores a single question against a submitted answer. Returns points earned (0 or full). */
export function scoreQuestion(
  question: IQuestion,
  answer: SubmittedAnswer | undefined
): number {
  if (!answer) return 0;

  const correctIds = question.options
    .filter((o) => o.isCorrect)
    .map((o) => o._id.toString())
    .sort();

  const selectedIds = [...answer.selectedOptionIds].sort();

  if (question.type === "single") {
    return selectedIds.length === 1 && selectedIds[0] === correctIds[0]
      ? question.points
      : 0;
  }

  // multi: exact match only — all correct options selected, zero incorrect ones
  const isExactMatch =
    selectedIds.length === correctIds.length &&
    selectedIds.every((id, i) => id === correctIds[i]);

  return isExactMatch ? question.points : 0;
}

/** Scores an entire attempt against a quiz's questions. */
export function calculateScore(questions: IQuestion[], answers: SubmittedAnswer[]) {
  const answersByQuestionId = new Map(answers.map((a) => [a.questionId, a]));

  let earnedPoints = 0;
  let totalPoints = 0;
  let correctCount = 0;

  for (const question of questions) {
    const answer = answersByQuestionId.get(question._id.toString());
    const points = scoreQuestion(question, answer);

    earnedPoints += points;
    totalPoints += question.points;
    if (points > 0) correctCount++;
  }

  const scorePercentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

  return { scorePercentage, correctCount };
}