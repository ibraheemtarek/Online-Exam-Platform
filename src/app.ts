import express from "express";
import testDBConnection from "./config/db.connection.js";
import globalErrHandler from "./common/middlewares/globalErr.middleware.js";
import quizRouter from "./modules/quiz/quiz.routes.js";
import AuthRoute from "./modules/auth/auth.routes.js";


const app = express();

app.use(express.json());

await testDBConnection();

app.use("/api/quiz",quizRouter);

//middlewares
app.use(AuthRoute);

//Middleware Error Handler
app.use(globalErrHandler);

export default app;
