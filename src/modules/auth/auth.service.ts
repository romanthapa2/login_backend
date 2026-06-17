
import { prisma } from "../../prisma";
import { hashPassword, verifyPassword } from "../../users_data";
import { LoginInput, RegisterInput } from "./auth.validate";

export const loginService = async (logininput: LoginInput) => {
  try {
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

    return user;
  } catch (error) {
    throw new Error("something went wrong");
  }
};

export const registerService = async (registerInput: RegisterInput) => {
  try {
    const { name, email, password, phone, address } = registerInput;
    const user = await prisma.user.findUnique({
      where: {
        email: email,
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

    return newUser;
  } catch (error) {
    throw new Error("something went wrong");
  }
};
