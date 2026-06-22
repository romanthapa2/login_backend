import type { JwtPayload, jwtRefreshPayload } from "../modules/auth/token/token.service";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      verifiedRefreshToken?: jwtRefreshPayload
    }
  }
}

export {};
