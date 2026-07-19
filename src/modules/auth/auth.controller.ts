import { loginSchema, registerSchema } from "./auth.validate";
import { CookieOptions, Request, Response } from "express";
import { loginService, refreshService, registerService } from "./auth.service";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "./token/token.service";
import { getTenantPrisma } from "../../database/tenant-client";
import { asyncHandler } from "../../../utils/asyncHandler";
import { ApiError } from "../../../utils/apiError";
import { apiResponse } from "../../../utils/apiResponse";

export const accesscookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  maxAge: 40 * 1000,
};

export const refreshcookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  maxAge: 80 * 1000,
};

export const loginController = asyncHandler(async (req: Request, res: Response) => {
  const validateInput = loginSchema.safeParse(req.body);

  if (!validateInput.success) {
    throw new ApiError(400, "all fields are required and must be valid");
  }

  const user = await loginService(validateInput.data);

  const tokenId = await refreshService(user.id);

  const token = generateAccessToken({ id: user.id, email: user.email });

  const refreshToken = generateRefreshToken({ userId: user.id, tokenId });

  res.cookie("token",token, accesscookieOptions).cookie("refreshToken", refreshToken, refreshcookieOptions);

  return apiResponse(res, 200, "login successful", { user });
});

export const RegisterController = asyncHandler(async (req: Request, res: Response) => {
  const validateInput = registerSchema.safeParse(req.body);

  if (!validateInput.success) {
    throw new ApiError(400, "all fields are required and must be valid");
  }

  const user = await registerService(validateInput.data);

  const tokenId = await refreshService(user.id);
  const token = generateAccessToken({ id: user.id, email: user.email });

  const refreshToken = generateRefreshToken({ userId: user.id, tokenId });


  res.cookie("token",token, accesscookieOptions).cookie("refreshToken", refreshToken, refreshcookieOptions);

  return apiResponse(res, 201, "user created successfully", { user });
});

// export const refreshTokenController = async (req: Request, res: Response) => {
//   try {
//     const refreshToken = req.verifiedRefreshToken;
//     if (!refreshToken) {
//       return res.status(401).json({ message: "Refresh token missing." });
//     }

//     const refreshdb = await prisma.refreshToken.findUnique({ where: { tokenId: refreshToken.tokenId } });

//     if (!refreshdb) {
//       return res.status(401).json({ message: "token not found" });
//     }

//     await prisma.refreshToken.delete({
//       where: {
//         tokenId: refreshToken.tokenId,
//       },
//     });

//     const tokenId = await refreshService(refreshToken.userId);

//     const newRefreshToken = generateRefreshToken({ userId: refreshToken.userId, tokenId });

//     const user = await prisma.user.findUnique({ where: { id: refreshToken.userId } });
//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     const newAccessToken = generateAccessToken({ id: user.id, email: user.email });

//     return res
//       .status(200)
//       .cookie("token", newAccessToken, accesscookieOptions)
//       .cookie("refreshToken", newRefreshToken, refreshcookieOptions)
//       .json({ message: "Token refreshed successfully." });
//   } catch (error) {
//     return res.status(401).json({ message: "Invalid or expired refresh session tokens." });
//   }
// };

export const getme = asyncHandler(async (req: Request, res: Response) => {
  const prisma = await getTenantPrisma();
  const user = req.user;
  const getUserinfo = await prisma.user.findUnique({
    where: {
      email: user?.email,
    },
  });

  return apiResponse(res, 200, "user info fetched successfully", getUserinfo);
});
