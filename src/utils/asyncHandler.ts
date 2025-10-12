import { Request, Response, NextFunction, RequestHandler } from "express";

// For general async routes
type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

// For authenticated async routes
interface AuthRequest extends Request {
  userId?: number;
}

type AsyncAuthRequestHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const authAsyncHandler = (
  fn: AsyncAuthRequestHandler
): RequestHandler => {
  return (req, res, next) => {
    fn(req as AuthRequest, res, next).catch(next);
  };
};
