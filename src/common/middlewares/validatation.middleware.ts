import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { BadRequestError } from "../errors/domain.exceptions.js";

type keyofRequest = keyof Request;
export function validation(
  validationSchema: Partial<Record<keyofRequest, ZodType>>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationErrors: { path: PropertyKey[]; message: string }[] = [];

    for (const key of Object.keys(validationSchema) as keyofRequest[]) {
      if (validationSchema[key] == undefined) {
        continue;
      }
      const validationResult = validationSchema[key].safeParse(req[key]);
      if (!validationResult.success) {
        validationErrors.push(
          ...validationResult.error.issues.map((i) => {
            return {
              path: i.path,
              message: i.message,
            };
          }),
        );
      }
    }
    if (validationErrors.length > 0) {
      throw new BadRequestError("validation error", {
        error: validationErrors,
      });
    }
    next();
  };
}