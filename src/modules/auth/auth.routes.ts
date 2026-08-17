import express from "express";
import {
  AuthSigninHandler,
  AuthSignupHandler,
  AuthForgetPasswordHandler,
  AuthResetPasswordHandler,
  AuthSetNewPasswordHandler,
} from "./auth.controlers.js";

const AuthRoute = express.Router();
//Routes
AuthRoute.post("/api/auth/signin", AuthSigninHandler);
AuthRoute.post("/api/auth/signup", AuthSignupHandler);
AuthRoute.post("/api/auth/forget-password", AuthForgetPasswordHandler);
AuthRoute.post("/api/auth/reset-password", AuthResetPasswordHandler);
AuthRoute.post("/api/auth/update-password", AuthSetNewPasswordHandler);

export default AuthRoute;
