import express from "express";

import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { loginSchema, registerSchema } from "./validation_using_zod";
import { prisma } from "./prisma";
import { hashPassword, verifyPassword } from "./users_data";


dotenv.config();
const JWT_SECRET: string = process.env.JWT_SECRET || "";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Backend is running",
    status: "ok",
  });
});

app.post("/login", async(req, res) => {
  try {
    const validateData = loginSchema.safeParse(req.body);

    if(!validateData.success){
      return res.status(400).json({message: "email and password are required and must be valid"})
    }

    const {email, password } = validateData.data;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!existingUser || !(await verifyPassword(password, existingUser.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      message: "Login successful",
      user: { id: existingUser.id, email: existingUser.email },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/register", async(req, res) => {
  try {
    

    const validateData = registerSchema.safeParse(req.body);

    if (!validateData.success){
        return res.status(400).json({message: "All fields are required and must be valid"})
    }

   const { email, password,phone ,address, name } = validateData.data;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if(existingUser){
      return res.status(400).json({message: "User with this email already exists"})
    }

    const hashedPassword = hashPassword(password);

    const  newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        address,
        phone,
      },
    })


    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
      },
      JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(201).json({
      message: "User registered successfully",
      user: { id: newUser.id, email: newUser.email },
      token
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


