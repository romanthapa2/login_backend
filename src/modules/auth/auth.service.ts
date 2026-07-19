import { ApiError } from "../../../utils/apiError";
import {getTenantPrisma} from "../../database/tenant-client";
import { hashPassword, verifyPassword } from "../../users_data";
import { refreshcookieOptions } from "./auth.controller";
import { LoginInput, RegisterInput } from "./auth.validate";

export const sanitizeUser = (user: any) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  address: user.address,
});

export const loginService = async (logininput: LoginInput) => {
  const prisma = await getTenantPrisma();
  const user = await prisma.user.findUnique({
    where: {
      email: logininput.email,
    },
  });

  if (!user) {
    throw new ApiError(401,"User does not exist. please register first");
  }

  if (!verifyPassword(logininput.password, user.passwordHash)) {
    throw new ApiError(401,"incorrect password");
  }

  return sanitizeUser(user);
};

export const registerService = async (registerInput: RegisterInput) => {
  const prisma = await getTenantPrisma();
  const { name, email, password } = registerInput;
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (user) {
    throw new ApiError(409,"user already exists. please login");
  }

  const hashedPassword = hashPassword(password);

  const newUser = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: hashedPassword,
      role: "ADMIN",
    },
  });

  return sanitizeUser(newUser);
};

export const refreshService = async (userId: number) => {
  const prisma = await getTenantPrisma();
  const tokenId = crypto.randomUUID();
  const expirationDate = new Date(Date.now() + (refreshcookieOptions.maxAge!));
  await prisma.refreshToken.create({
    data: {
      tokenId,
      userId,
      expiredAt:expirationDate
    },
  });

  return tokenId;
};
