import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../modules/auth/token/token.service";

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "unauthorized" });
    }

    req.user = verifyAccessToken(token);
    next();
  } catch (error) {
    res.status(401).json({ message: "invalid or expired token" });
  }
};
