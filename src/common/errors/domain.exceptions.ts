import CustomError from "./custom.error.js";

export class BadRequestError extends CustomError {
  constructor(message: string = "Bad request", cause?: unknown) {
    super(message, 400, cause);
  }
}
export class unauthorizedExceptionError extends CustomError {
  constructor(message: string = "unauthorized", cause?: unknown) {
    super(message, 401, cause);
  }
}
export class notFoundError extends CustomError {
  constructor(message: string = "Not found", cause?: unknown) {
    super(message, 404, cause);
  }
}
export class ConflictException extends CustomError {
  constructor(message: string = "Conflict", cause?: unknown) {
    super(message, 409, cause);
  }
}
