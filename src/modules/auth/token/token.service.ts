import jwt from "jsonwebtoken";

export interface JwtPayload {
  id: number;
  email: string;
}

export interface jwtRefreshPayload {
  userId: number;
  tokenId: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "";

export const generateAccessToken = (user: JwtPayload): string => {
  return jwt.sign(user, JWT_SECRET);
};

export const generateRefreshToken = (user: jwtRefreshPayload): string => {
  return jwt.sign(user, JWT_REFRESH_SECRET);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): jwtRefreshPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as jwtRefreshPayload;
};
