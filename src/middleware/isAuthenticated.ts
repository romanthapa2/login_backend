import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../modules/auth/token/token.service";
import { verify } from "jsonwebtoken";

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;

    console.log(token);
    
    // if (!token?.startsWith("Bearer ")) {
    //   return res.status(401).json({ message: "unauthorized" });
    // }

    // const accesstoken = token.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "unauthorized" });
    }

    const payload= verifyAccessToken(token);

    if(!payload){
      return res.status(401).json({message: 'unauthorized'});
    }

    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ message: "invalid or expired token" });
  }
};
