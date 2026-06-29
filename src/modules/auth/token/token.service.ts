import jwt,{JsonWebTokenError, TokenExpiredError,} from "jsonwebtoken";

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

export const verifyAccessToken = (
  token: string,
): {status: "valid"; payload: JwtPayload } | { status: "expired"} | {status:"invalid";} => {
  try {
    const payload= jwt.verify(token, JWT_SECRET) as JwtPayload;

    return {
      status: "valid",
      payload
    }
  } catch (error) {
     if (error instanceof TokenExpiredError) {
      return {
        status: "expired",
      };
    }

    if (error instanceof JsonWebTokenError) {
      return {
        status: "invalid",
      };
    }
    throw error;
  }
};

export const verifyRefreshToken = (token: string): jwtRefreshPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as jwtRefreshPayload;
};
