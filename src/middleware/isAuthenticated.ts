import { Request, Response, NextFunction } from "express";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../modules/auth/token/token.service";
import { prisma } from "../prisma";
import { accesscookieOptions, refreshcookieOptions } from "../modules/auth/auth.controller";
import { refreshService } from "../modules/auth/auth.service";

const authenticateWithRefresh = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    return res.status(401).json({
      message: "Invalid refresh token",
    });
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: {
      tokenId: payload.tokenId,
    },
    include: {
      user: true,
    },
  });

  if (!storedToken) {
    return res.status(401).json({
      message: "Refresh token revoked",
    });
  }

    if (storedToken.expiredAt < new Date()) {
    await prisma.refreshToken.delete({
      where: {
        tokenId: storedToken.tokenId,
      },
    });

    return res.status(401).json({
      message: "Refresh token expired",
    });
  }


  const user = storedToken.user;


    await prisma.refreshToken.delete({
    where: {
      tokenId: storedToken.tokenId,
    },
  });

  const createRefreshDB = await refreshService(user.id);

  const newRefrshToken = generateRefreshToken({
    userId:user.id,
    tokenId : createRefreshDB,
  })


  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
  });

  res.cookie("token", accessToken, accesscookieOptions);

  res.cookie("refreshToken",newRefrshToken,refreshcookieOptions);

  req.user = {
    id: user.id,
    email: user.email,
  };

  return next();
};

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. take access token and if valid return value to next()
    // 2. if expired then take refresh token and create a new access token and return value to next()
    // 3. if invalid acess token then return error

    const bearerToken = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : undefined;

    const accessToken = bearerToken || req.cookies?.token;

    if (!accessToken) {
      return authenticateWithRefresh(req, res, next);
    }

    const result = verifyAccessToken(accessToken);

    switch (result.status) {
      case "valid":
        req.user = result.payload;
        return next();

      case "expired":
        return authenticateWithRefresh(req, res, next);

      case "invalid":
        return res.status(401).json({
          message: "Invalid access token",
        });
    }
  } catch (error) {
    res.status(401).json({ message: "invalid or expired token" });
  }
};
