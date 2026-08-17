
import { Types } from "mongoose";
import { calculateScore, scoreQuestion, type SubmittedAnswer } from "./score-calculator.js";
import type { IQuestion } from "../quiz.model.js";

//  scoreQuestion test cases
describe("scoreQuestion", () => { 
    it("returns 0 when no answer is submitted", () => {
        const question: IQuestion ={
            _id: new Types.ObjectId(),
            text: "What is 2 + 2?",
            type: "single",
            points: 5,
            options: [{ _id: new Types.ObjectId(), text: "react", isCorrect: true }, { _id: new Types.ObjectId(), text: "javascript", isCorrect: false }]
        }
        const result = scoreQuestion(question, undefined);
        expect(result).toBe(0);
    })

    it("returns full points when the correct answer is submitted", () => {
  
        const correctOptionId = new Types.ObjectId();

        const question: IQuestion ={
            _id: new Types.ObjectId(),
            text: "What is 2 + 2?",
            type: "single",
            points: 5,
            options: [{ _id: correctOptionId, text: "react", isCorrect: true }, { _id: new Types.ObjectId(), text: "javascript", isCorrect: false }]
        }

        const answer: SubmittedAnswer = {
        questionId: question._id.toString(),
        selectedOptionIds: [correctOptionId.toString()],
  };

        const result = scoreQuestion(question, answer);
        expect(result).toBe(5);
    });

    it("returns 0 when the wrong answer is submitted", () => {
  const correctOptionId = new Types.ObjectId();
  const wrongOptionId = new Types.ObjectId();

  const question: IQuestion = {
    _id: new Types.ObjectId(),
    text: "What is 2 + 2?",
    type: "single",
    points: 5,
    options: [
      {
        _id: correctOptionId,
        text: "4",
        isCorrect: true,
      },
      {
        _id: wrongOptionId,
        text: "3",
        isCorrect: false,
      },
    ],
  };

  const answer: SubmittedAnswer = {
    questionId: question._id.toString(),
    selectedOptionIds: [wrongOptionId.toString()],
  };

  const result = scoreQuestion(question, answer);

  expect(result).toBe(0);
});

  it("returns 0 when multiple options are selected for a single-choice question", () => {
  const correctOptionId = new Types.ObjectId();
  const wrongOptionId = new Types.ObjectId();

  const question: IQuestion = {
    _id: new Types.ObjectId(),
    text: "What is 2 + 2?",
    type: "single",
    points: 5,
    options: [
      {
        _id: correctOptionId,
        text: "4",
        isCorrect: true,
      },
      {
        _id: wrongOptionId,
        text: "3",
        isCorrect: false,
      },
    ],
  };

  const answer: SubmittedAnswer = {
    questionId: question._id.toString(),
    selectedOptionIds: [
      correctOptionId.toString(),
      wrongOptionId.toString(),
    ],
  };

  const result = scoreQuestion(question, answer);

  expect(result).toBe(0);
});


it("returns full points when all correct options are selected for a multi-choice question", () => {
  const correctOption1Id = new Types.ObjectId();
  const correctOption2Id = new Types.ObjectId();
  const wrongOptionId = new Types.ObjectId();

  const question: IQuestion = {
    _id: new Types.ObjectId(),
    text: "Which are JavaScript frameworks?",
    type: "multi",
    points: 10,
    options: [
      {
        _id: correctOption1Id,
        text: "React",
        isCorrect: true,
      },
      {
        _id: correctOption2Id,
        text: "Vue",
        isCorrect: true,
      },
      {
        _id: wrongOptionId,
        text: "HTML",
        isCorrect: false,
      },
    ],
  };

  const answer: SubmittedAnswer = {
    questionId: question._id.toString(),
    selectedOptionIds: [
      correctOption1Id.toString(),
      correctOption2Id.toString(),
    ],
  };

  const result = scoreQuestion(question, answer);

  expect(result).toBe(10);
});


it("returns 0 when a correct option is missing in a multi-choice question", () => {
  const correctOption1Id = new Types.ObjectId();
  const correctOption2Id = new Types.ObjectId();

  const question: IQuestion = {
    _id: new Types.ObjectId(),
    text: "Which are JavaScript frameworks?",
    type: "multi",
    points: 10,
    options: [
      {
        _id: correctOption1Id,
        text: "React",
        isCorrect: true,
      },
      {
        _id: correctOption2Id,
        text: "Vue",
        isCorrect: true,
      },
    ],
  };

  const answer: SubmittedAnswer = {
    questionId: question._id.toString(),
    selectedOptionIds: [correctOption1Id.toString()],
  };

  const result = scoreQuestion(question, answer);

  expect(result).toBe(0);
});


it("returns 0 when an incorrect option is selected in a multi-choice question", () => {
  const correctOption1Id = new Types.ObjectId();
  const correctOption2Id = new Types.ObjectId();
  const wrongOptionId = new Types.ObjectId();

  const question: IQuestion = {
    _id: new Types.ObjectId(),
    text: "Which are JavaScript frameworks?",
    type: "multi",
    points: 10,
    options: [
      {
        _id: correctOption1Id,
        text: "React",
        isCorrect: true,
      },
      {
        _id: correctOption2Id,
        text: "Vue",
        isCorrect: true,
      },
      {
        _id: wrongOptionId,
        text: "HTML",
        isCorrect: false,
      },
    ],
  };

  const answer: SubmittedAnswer = {
    questionId: question._id.toString(),
    selectedOptionIds: [
      correctOption1Id.toString(),
      correctOption2Id.toString(),
      wrongOptionId.toString(),
    ],
  };

  const result = scoreQuestion(question, answer);
  expect(result).toBe(0);
        });
    })


describe("calculateScore", () => {
  it("returns 0 percentage and 0 correctCount when there are no questions", () => {
    const result = calculateScore([], []);

    expect(result.scorePercentage).toBe(0);
    expect(result.correctCount).toBe(0);
  });

  it("returns 0 percentage and 0 correctCount when questions exist but no answers are submitted", () => {
    const question: IQuestion = {
      _id: new Types.ObjectId(),
      text: "What is 2 + 2?",
      type: "single",
      points: 5,
      options: [
        { _id: new Types.ObjectId(), text: "4", isCorrect: true },
        { _id: new Types.ObjectId(), text: "3", isCorrect: false },
      ],
    };

    const result = calculateScore([question], []);

    expect(result.scorePercentage).toBe(0);
    expect(result.correctCount).toBe(0);
  });

  it("returns 100 percentage when all questions are answered correctly", () => {
    const correctId1 = new Types.ObjectId();
    const correctId2 = new Types.ObjectId();

    const question1: IQuestion = {
      _id: new Types.ObjectId(),
      text: "What is 2 + 2?",
      type: "single",
      points: 5,
      options: [
        { _id: correctId1, text: "4", isCorrect: true },
        { _id: new Types.ObjectId(), text: "3", isCorrect: false },
      ],
    };

    const question2: IQuestion = {
      _id: new Types.ObjectId(),
      text: "Capital of France?",
      type: "single",
      points: 10,
      options: [
        { _id: correctId2, text: "Paris", isCorrect: true },
        { _id: new Types.ObjectId(), text: "London", isCorrect: false },
      ],
    };

    const answers: SubmittedAnswer[] = [
      { questionId: question1._id.toString(), selectedOptionIds: [correctId1.toString()] },
      { questionId: question2._id.toString(), selectedOptionIds: [correctId2.toString()] },
    ];

    const result = calculateScore([question1, question2], answers);

    expect(result.scorePercentage).toBe(100);
    expect(result.correctCount).toBe(2);
  });

  it("returns 0 percentage when all questions are answered incorrectly", () => {
    const correctId1 = new Types.ObjectId();
    const wrongId1 = new Types.ObjectId();
    const correctId2 = new Types.ObjectId();
    const wrongId2 = new Types.ObjectId();

    const question1: IQuestion = {
      _id: new Types.ObjectId(),
      text: "What is 2 + 2?",
      type: "single",
      points: 5,
      options: [
        { _id: correctId1, text: "4", isCorrect: true },
        { _id: wrongId1, text: "3", isCorrect: false },
      ],
    };

    const question2: IQuestion = {
      _id: new Types.ObjectId(),
      text: "Capital of France?",
      type: "single",
      points: 10,
      options: [
        { _id: correctId2, text: "Paris", isCorrect: true },
        { _id: wrongId2, text: "London", isCorrect: false },
      ],
    };

    const answers: SubmittedAnswer[] = [
      { questionId: question1._id.toString(), selectedOptionIds: [wrongId1.toString()] },
      { questionId: question2._id.toString(), selectedOptionIds: [wrongId2.toString()] },
    ];

    const result = calculateScore([question1, question2], answers);

    expect(result.scorePercentage).toBe(0);
    expect(result.correctCount).toBe(0);
  });

  it("computes a partial percentage weighted by points, not by question count", () => {
    const correctId1 = new Types.ObjectId();
    const wrongId1 = new Types.ObjectId();
    const correctId2 = new Types.ObjectId();

    // question1 worth 5 points, answered wrong
    const question1: IQuestion = {
      _id: new Types.ObjectId(),
      text: "What is 2 + 2?",
      type: "single",
      points: 5,
      options: [
        { _id: correctId1, text: "4", isCorrect: true },
        { _id: wrongId1, text: "3", isCorrect: false },
      ],
    };

    // question2 worth 15 points, answered correctly
    const question2: IQuestion = {
      _id: new Types.ObjectId(),
      text: "Capital of France?",
      type: "single",
      points: 15,
      options: [
        { _id: correctId2, text: "Paris", isCorrect: true },
        { _id: new Types.ObjectId(), text: "London", isCorrect: false },
      ],
    };

    const answers: SubmittedAnswer[] = [
      { questionId: question1._id.toString(), selectedOptionIds: [wrongId1.toString()] },
      { questionId: question2._id.toString(), selectedOptionIds: [correctId2.toString()] },
    ];

    const result = calculateScore([question1, question2], answers);

    // earned 15 / total 20 = 75%
    expect(result.scorePercentage).toBe(75);
    expect(result.correctCount).toBe(1);
  });

  it("treats a question with no matching submitted answer as unanswered (0 points) without throwing", () => {
    const correctId1 = new Types.ObjectId();
    const correctId2 = new Types.ObjectId();

    const question1: IQuestion = {
      _id: new Types.ObjectId(),
      text: "What is 2 + 2?",
      type: "single",
      points: 5,
      options: [
        { _id: correctId1, text: "4", isCorrect: true },
        { _id: new Types.ObjectId(), text: "3", isCorrect: false },
      ],
    };

    const question2: IQuestion = {
      _id: new Types.ObjectId(),
      text: "Capital of France?",
      type: "single",
      points: 10,
      options: [
        { _id: correctId2, text: "Paris", isCorrect: true },
        { _id: new Types.ObjectId(), text: "London", isCorrect: false },
      ],
    };

    // Only question2 is answered; question1 has no corresponding answer.
    const answers: SubmittedAnswer[] = [
      { questionId: question2._id.toString(), selectedOptionIds: [correctId2.toString()] },
    ];

    const result = calculateScore([question1, question2], answers);

    // earned 10 / total 15 ≈ 66.67%
    expect(result.scorePercentage).toBeCloseTo(66.666, 2);
    expect(result.correctCount).toBe(1);
  });

  it("ignores extra submitted answers that don't correspond to any question", () => {
    const correctId1 = new Types.ObjectId();

    const question1: IQuestion = {
      _id: new Types.ObjectId(),
      text: "What is 2 + 2?",
      type: "single",
      points: 5,
      options: [
        { _id: correctId1, text: "4", isCorrect: true },
        { _id: new Types.ObjectId(), text: "3", isCorrect: false },
      ],
    };

    const answers: SubmittedAnswer[] = [
      { questionId: question1._id.toString(), selectedOptionIds: [correctId1.toString()] },
      // stray answer for a question that isn't in the quiz
      { questionId: new Types.ObjectId().toString(), selectedOptionIds: [new Types.ObjectId().toString()] },
    ];

    const result = calculateScore([question1], answers);

    expect(result.scorePercentage).toBe(100);
    expect(result.correctCount).toBe(1);
  });

  it("correctly counts a multi-choice question toward correctCount only on an exact match", () => {
    const correctId1 = new Types.ObjectId();
    const correctId2 = new Types.ObjectId();
    const wrongId = new Types.ObjectId();

    const question: IQuestion = {
      _id: new Types.ObjectId(),
      text: "Which are JavaScript frameworks?",
      type: "multi",
      points: 10,
      options: [
        { _id: correctId1, text: "React", isCorrect: true },
        { _id: correctId2, text: "Vue", isCorrect: true },
        { _id: wrongId, text: "HTML", isCorrect: false },
      ],
    };

    // partial selection: missing correctId2
    const answers: SubmittedAnswer[] = [
      { questionId: question._id.toString(), selectedOptionIds: [correctId1.toString()] },
    ];

    const result = calculateScore([question], answers);

    expect(result.scorePercentage).toBe(0);
    expect(result.correctCount).toBe(0);
  });
});
