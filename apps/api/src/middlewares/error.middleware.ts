import { Request, Response, NextFunction } from 'express';

// Export a class for creating HTTP errors
export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

// The existing error handler middleware, now updated to use HttpError
export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction): void => {
  // console.error(err.stack);

  // Check if it's an instance of our HttpError
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  } else {
    // Handle generic errors
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }
};