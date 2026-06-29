import { Router } from "express";

import { getme, loginController, RegisterController } from "./auth.controller";
import { verifyToken } from "../../middleware/isAuthenticated";
// import { validateRefreshToken } from "../../middleware/refreshToken";

const authRouter = Router();

authRouter.post("/login", loginController);
authRouter.post("/register", RegisterController);
// authRouter.post("/refresh", validateRefreshToken, refreshTokenController);
authRouter.get("/me", verifyToken, getme);

export default authRouter;
