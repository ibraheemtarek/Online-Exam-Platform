import type { Request, Response, NextFunction } from "express";
import { JWT_SECRET } from "../../config/env.variables.js";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { unauthorizedExceptionError } from "../errors/domain.exceptions.js";
import CustomError from "../errors/custom.error.js";
import { UserRole } from "../../modules/auth/auth.dto.js";

export const isAuth = (
  role: UserRole = UserRole.USER
) => {
  return (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new CustomError("Invalid token", 401);
    }

    const token = authHeader.slice(7);
    const userData = jwt.verify(token, JWT_SECRET) as JwtPayload &{ role: UserRole };

    if (userData.role !== role) {
        throw new CustomError("Forbidden", 403);
      }

    (req as any).user = userData;
    
    next();
  } catch (err) {
    next(err);
  }
}};
