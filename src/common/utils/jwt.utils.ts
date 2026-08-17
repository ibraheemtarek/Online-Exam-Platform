import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/env.variables.js";

interface JwtPayloadData {
  userId: string;
  email: string;
  role: string;
}

export const generateWebToken = (payload: JwtPayloadData): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
};
