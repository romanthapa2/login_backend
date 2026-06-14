import { Router } from "express";

import { loginController,RegisterController } from "./auth.controller";

const authRouter = Router();

authRouter.post("/login",loginController);
authRouter.post("/register",RegisterController);

export default authRouter;