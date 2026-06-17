import { loginSchema, registerSchema } from "./auth.validate";
import { CookieOptions, Request, Response } from "express";
import { loginService, registerService } from "./auth.service";
import { generateAccessToken } from "./token/token.service";
import { prisma } from "../../prisma";

export const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  maxAge: 15 * 60 * 1000,
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const validateInput = loginSchema.safeParse(req.body);

    if (!validateInput.success) {
      return res.json("please enter a valid credentials");
    }

    const user = await loginService(validateInput.data);

    const token = generateAccessToken({ id: user.id, email: user.email });

    return res.status(200).cookie("token", token, cookieOptions).json({
      message: "login successful",
      user,
    });
  } catch (error) {
    return res.status(400).json("something went wrong");
  }
};

export const RegisterController = async (req: Request, res: Response) => {
  try {
    const validateInput = registerSchema.safeParse(req.body);

    if (!validateInput.success) {
      return res.status(400).json({
        message: "all fields are required and must be valid",
      });
    }

    const user = await registerService(validateInput.data);
    const token = generateAccessToken({ id: user.id, email: user.email });

    return res.status(201).cookie("token", token, cookieOptions).json({
      message: "User registered successfully",
      user,
    });
  } catch {
    return res.status(500).json({ message: "server error" });
  }
};

export const getme = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const getUserinfo = await prisma.user.findUnique({
      where: {
        email: user?.email,
      },
    });

    return res.status(200).json(getUserinfo);
  } catch {
    return res.status(500).json({ message: "server error" });
  }
};
