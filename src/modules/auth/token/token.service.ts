import jwt,{SignOptions} from "jsonwebtoken";

export interface JwtPayload{
  id:number,
  email:string
}

const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

export const generateAccessToken = (user:JwtPayload):string =>{
  return jwt.sign(user, JWT_SECRET, {expiresIn : JWT_EXPIRES_IN as SignOptions['expiresIn']});
}

export const verifyAccessToken = (token: string):JwtPayload =>{
  return jwt.verify(token,JWT_SECRET) as JwtPayload;
}