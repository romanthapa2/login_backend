import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRouter from "./modules/auth/auth.routes";

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

app.use(authRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


