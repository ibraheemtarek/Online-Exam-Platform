//Types
import type { Request, Response, NextFunction } from "express";

import {
  AuthSigninService,
  AuthSignupService,
  AuthForgetPasswordService,
  AuthResetPasswordService,
} from "./auth.services.js";
import { unauthorizedExceptionError } from "../../common/errors/domain.exceptions.js";
import CustomError from "../../common/errors/custom.error.js";
import type { UserRole } from "./auth.dto.js";

//handle signin endpoint
export const AuthSigninHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await AuthSigninService(req.body);
    if (result) {
      res.status(200).json({
        success: true,
        data: result,
      });
    } else {
      next(new unauthorizedExceptionError());
    }
  } catch (error: any) {
    next(new CustomError(error.message, 500));
  }
};
//handle signup endpoint
export const AuthSignupHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await AuthSignupService(req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

//handel forget password endpoint
export const AuthForgetPasswordHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const email: string = req.body.email;
    const result = await AuthForgetPasswordService(email);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

//handel reset password endpoint
export const AuthResetPasswordHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(req.body);
  try {
    const resetToken: string = req.body.resetToken;
    const result = await AuthResetPasswordService(resetToken);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

//set new password
export const AuthSetNewPasswordHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { passwordHash, confirmPasswordHash } = req.body;
};
