import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { addUser, findUser, getusers, verifyPassword } from "./users_data.js";
import jwt from "jsonwebtoken";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

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

app.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const existingUser = findUser(username);

    if (!existingUser || !verifyPassword(password, existingUser.password)) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      {
        id: existingUser.id,
        username: existingUser.username,
      },
      JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      message: "Login successful",
      user: { id: existingUser.id, username: existingUser.username },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/register", (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    if (findUser(username)) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const newUser = addUser({ username, password });

    const token = jwt.sign(
      {
        id: newUser.id,
        username: newUser.username,
      },
      JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(201).json({
      message: "User registered successfully",
      user: { id: newUser.id, username: newUser.username },
      token
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
