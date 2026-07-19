
import { Request, Response, NextFunction } from "express";


type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown> | unknown;

export const asyncHandler = (fn:AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
};

// why promise.resolve because it returns the promise either way, if the function returns undefined or a promise.

// catch(next) is same as .catch((err) => next(err)) because next is a function that takes an error as an argument and passes it to the next middleware.  how it knows is because the error handling middleware has the 4 arguments (err, req, res, next) and express will automatically call it when next is called with an error.

