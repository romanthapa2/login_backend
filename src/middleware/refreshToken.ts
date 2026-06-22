import { Request, Response, NextFunction } from "express";
import { verifyRefreshToken } from "../modules/auth/token/token.service";
import { prisma } from "../prisma";

export const validateRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokenFromCookie = req.cookies.refreshToken;
    if (!tokenFromCookie) {
      return res.status(401).json({ message: "Refresh token missing." });
    }

    const decoded = verifyRefreshToken(tokenFromCookie);

    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const refreshToken = await prisma.refreshToken.findUnique({
      where: {
        tokenId: decoded.tokenId,
      },
    });

    if (!refreshToken) {
      return res.status(401).json({
        message: "token not found",
      });
    }

    req.verifiedRefreshToken = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired refresh session." });
  }
};
