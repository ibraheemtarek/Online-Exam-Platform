# Online Exam API

A Node.js/TypeScript REST API for creating and taking online quizzes/exams. It supports admin-managed quiz authoring and student quiz-taking flows, including timed attempts, answer submission, scoring, and result review — backed by MongoDB via Mongoose.

## Features

- **Authentication** — signup, signin, forgot/reset password, and password updates using JWT.
- **Quiz Management (Admin)** — create, list, view, update, and delete quizzes, including nested questions and options.
- **Quiz Taking (Student)** — browse published quizzes, view quiz details, start a timed attempt, submit answers, and view results/review.
- **Role-based data model** — users have a `role` (default `USER`) via the `UserRole` enum.
- **Scoring** — attempts track score percentage, pass/fail status, and correct answer count.

## Tech Stack

| Layer            | Technology                                   |
| ---------------- | -------------------------------------------- |
| Runtime          | Node.js (ESM, `"type": "module"`)            |
| Language         | TypeScript                                   |
| Web framework    | Express 5                                    |
| Database / ODM   | MongoDB / Mongoose                           |
| Auth             | JSON Web Tokens (`jsonwebtoken`)             |
| Password hashing | `bcrypt-ts`                                  |
| Validation       | `zod`                                        |
| Email            | `nodemailer`                                 |
| Dev tooling      | `tsc --watch`, `concurrently`, `ts-node-dev` |

## Project Structure

```
.
├── modules/
│   ├── auth/
│   │   ├── auth.model.ts        # AuthModel (user) schema
│   │   ├── auth.dto.ts          # UserRole enum & DTOs
│   │   ├── auth.controlers.ts   # Auth request handlers
│   │   └── auth.route.ts        # /api/auth routes
│   └── quiz/
│       ├── quiz.model.ts        # Quiz schema (questions, options)
│       ├── quiz-attempt.model.ts# QuizAttempt schema
│       ├── quiz.controller.ts   # Quiz request handlers
│       └── quiz.route.ts        # /api/quiz(zes) routes
├── common/
│   └── middlewares/
│       └── auth.token.ts        # isAuth middleware (JWT verification)
├── server.ts                    # App entry point
├── dist/                        # Compiled output (tsc)
├── package.json
└── tsconfig.json
```

> Folder names above reflect the module layout implied by the code; adjust to match your actual repo layout if it differs.

## Data Models

### Auth (User)

| Field                                   | Type              | Notes                              |
| --------------------------------------- | ----------------- | ---------------------------------- |
| `firstName`, `lastName`                 | `string`          | Required                           |
| `email`                                 | `string`          | Required, unique                   |
| `image`                                 | `string`          | Required                           |
| `passwordHash`                          | `string`          | Required                           |
| `role`                                  | `UserRole`        | Defaults to `USER`                 |
| `token`, `resetToken`, `resetTokenDate` | `string` / `Date` | Used for auth/password reset flows |

### Quiz

| Field                                  | Type                    | Notes               |
| -------------------------------------- | ----------------------- | ------------------- |
| `title`, `description`, `instructions` | `string`                | Required            |
| `durationMinutes`                      | `number`                | Required, min `1`   |
| `passScorePercentage`                  | `number`                | Required, `0`–`100` |
| `questions`                            | `IQuestion[]`           | Embedded documents  |
| `createdBy`                            | `ObjectId` (ref `User`) | Required            |
| `isPublished`                          | `boolean`               | Defaults to `false` |

Each **Question** has `text`, `type` (`single` \| `multi`), `points` (min `1`), and 2+ **Options**, each with `text` and `isCorrect`.

### QuizAttempt

| Field                                       | Type                                        | Notes                                          |
| ------------------------------------------- | ------------------------------------------- | ---------------------------------------------- |
| `userId`, `quizId`                          | `ObjectId` refs                             | Required                                       |
| `startTime`                                 | `Date`                                      | Required                                       |
| `submittedAt`                               | `Date`                                      | Set on submission                              |
| `status`                                    | `"in_progress" \| "submitted" \| "expired"` | Defaults to `in_progress`                      |
| `scorePercentage`, `passed`, `correctCount` | number/boolean                              | Populated on scoring                           |
| `answers`                                   | `IAnswer[]`                                 | Each with `questionId` and `selectedOptionIds` |

Indexes: `{ userId: 1 }` and `{ userId: 1, quizId: 1 }` for efficient attempt lookups.

## Getting Started

### Prerequisites

- Node.js (version compatible with the TypeScript/`@types/node` versions in `package.json`)
- A running MongoDB instance (local or hosted, e.g., MongoDB Atlas)

### Installation

```bash
git clone https://github.com/elevate-node-c3/online-exam-api-team-e.git
cd online-exam-api-team-e
npm install
```

### Environment Variables

Create a `.env` file in the project root. Typical variables for this stack include:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/online-exam
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d

# Email (nodemailer) — for password reset, etc.
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

> Adjust variable names to match what's actually read in the codebase (e.g., in `server.ts`, `auth.controlers.ts`, and the mailer config).

### Running the App

```bash
npm start
```

This runs `tsc --watch` alongside `node --watch ./dist/server.js`, so it recompiles TypeScript and restarts the server automatically on changes.

## API Reference

Base path for auth routes: `/api/auth`
Base path for quiz routes: assumed to be mounted at `/api/quiz` (or similar) in `server.ts`.

### Auth Routes (`/api/auth`)

| Method | Endpoint                    | Description                      | Auth required |
| ------ | --------------------------- | -------------------------------- | ------------- |
| POST   | `/api/auth/signup`          | Register a new user              | No            |
| POST   | `/api/auth/signin`          | Log in and receive a token       | No            |
| POST   | `/api/auth/forget-password` | Request a password reset         | No            |
| POST   | `/api/auth/reset-password`  | Reset password using reset token | No            |
| POST   | `/api/auth/update-password` | Update password                  | No\*          |

\* No `isAuth` middleware is currently attached to this route — confirm whether it should be protected.

### Quiz Routes — Admin

| Method | Endpoint     | Description                    | Auth required  |
| ------ | ------------ | ------------------------------ | -------------- |
| POST   | `/admin`     | Create a quiz                  | Yes (`isAuth`) |
| GET    | `/admin`     | List all quizzes (admin view)  | No\*           |
| GET    | `/admin/:id` | Get a single quiz (admin view) | No\*           |
| PUT    | `/admin/:id` | Update a quiz                  | No\*           |
| DELETE | `/admin/:id` | Delete a quiz                  | No\*           |

\* Only the create route currently has `isAuth` attached; the other admin routes appear unprotected in the code shown. Consider adding `isAuth` (and role/admin checks) to these as well.

### Quiz Routes — Student

| Method | Endpoint                      | Description                           | Auth required |
| ------ | ----------------------------- | ------------------------------------- | ------------- |
| GET    | `/`                           | List published quizzes                | Yes           |
| GET    | `/:id`                        | Get quiz detail                       | Yes           |
| POST   | `/:id/start`                  | Start a quiz attempt                  | Yes           |
| POST   | `/attempts/:attemptId/submit` | Submit answers for an attempt         | Yes           |
| GET    | `/attempts/:attemptId/result` | Get attempt result (score, pass/fail) | Yes           |
| GET    | `/attempts/:attemptId/review` | Review answers for an attempt         | Yes           |

All student routes are protected by the `isAuth` middleware.

## Scripts

| Script  | Command                                                      | Description                                                             |
| ------- | ------------------------------------------------------------ | ----------------------------------------------------------------------- |
| `start` | `concurrently "tsc --watch" "node --watch ./dist/server.js"` | Compiles TypeScript in watch mode and runs the server with auto-restart |

## Notes / Suggestions

- The admin quiz routes (`list`, `get`, `update`, `delete`) don't currently apply `isAuth`; you may want to protect them consistently with the `createQuiz` route.
- The `/api/auth/update-password` route also has no `isAuth` middleware applied — verify this is intentional.
- Consider adding role-based authorization (e.g., an `isAdmin` middleware) to fully restrict `/admin/*` routes to admin users.

## License

ISC
