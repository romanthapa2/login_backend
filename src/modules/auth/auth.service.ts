import { prisma } from "../../prisma";
import { hashPassword, verifyPassword } from "../../users_data";
import { LoginInput, RegisterInput } from "./auth.validate";

export const sanitizeUser = (user: any) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  address: user.address,
});

export const loginService = async (logininput: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: {
      email: logininput.email,
    },
  });

  if (!user) {
    throw new Error("User does not exist. please register first");
  }

  if (!verifyPassword(logininput.password, user.password)) {
    throw new Error("incorrect password");
  }

  return sanitizeUser(user);
};

export const registerService = async (registerInput: RegisterInput) => {
  const { name, email, password, phone, address } = registerInput;
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (user) {
    throw new Error("user already exists. please login");
  }

  const hashedPassword = hashPassword(password);

  const newUser = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      phone,
      address,
    },
  });

  return sanitizeUser(newUser);
};

export const refreshService = async (userId: number) => {
  const tokenId = crypto.randomUUID();
  await prisma.refreshToken.create({
    data: {
      tokenId,
      userId,
    },
  });

  return tokenId;
};
