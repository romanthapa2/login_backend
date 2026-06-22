import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../modules/auth/token/token.service";
import { prisma } from "../prisma";

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    const authHeaders = req.headers.authorization;

    if (!authHeaders?.startsWith("Bearer ")) {
      token = authHeaders?.split(" ")[1];
    }

    if (!token) {
      token = req.cookies?.token;
    }

    if (!token) {
      return res.status(401).json({ message: "unauthorized" });
    }

    const payload = verifyAccessToken(token);

    if (!payload) {
      return res.status(401).json({ message: "unauthorized" });
    }

    const validateUser = await prisma.user.findUnique({
      where: {
        id: payload.id,
      },
    });

    if (!validateUser) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ message: "invalid or expired token" });
  }
};
