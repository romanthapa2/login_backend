import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const hashPassword = (password:string) =>{
    const salt = bcrypt.genSaltSync(parseInt(process.env.SALT_ROUNDS || '10'));
    return bcrypt.hashSync(password,salt);
}

const verifyPassword = (password:string, hashedPassword:string) => bcrypt.compareSync(password,hashedPassword);


export {hashPassword,verifyPassword};
