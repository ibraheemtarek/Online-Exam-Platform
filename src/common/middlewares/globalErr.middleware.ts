import type { NextFunction, Request, Response } from "express";
import CustomError from "../errors/custom.error.js";

export default function globalErrHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.statusCode,
        message: err.message,
      },
    });
  }

  console.error(
  "Unhandled error:",
  err,
  "Path:",
  req.originalUrl,
);
  // in case of using logger like pino or winston, you can log the error like this:
  /* logger.error(
  /   { err, path: req.originalUrl },
  /   "Unhandled error",
  / );
  */

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error",
    },
  });
}
