import { Router } from "express";

import { getme, loginController,RegisterController } from "./auth.controller";
import { verifyToken } from "../../middleware/isAuthenticated";



const authRouter = Router();

authRouter.post("/login",loginController);
authRouter.post("/register",RegisterController);
authRouter.get("/me",verifyToken,getme)

export default authRouter;