import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import {ApiError} from "../../utils/apiError";

export const globalErrorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let issues: { path: string; message: string }[] | null = null;

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    issues = err.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
  }

  else if (err instanceof ApiError) {
    statusCode = err.statusCode || 500;
    message = err.message || "Something went wrong";
  }

  else if (err instanceof Error) {
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(issues ? { issues } : {}),
  });
};

//  ... to add issues object into the response object.