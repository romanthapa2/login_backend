
import { loginSchema, registerSchema } from './auth.validate';
import { Request, Response } from 'express';
import { loginService, registerService } from './auth.service';
import { generateAccessToken } from './token/token.service';

export const loginController = async(req:Request,res:Response)=>{
    try{
    const validateInput = loginSchema.safeParse(req.body);

    if(!validateInput.success){
        return res.json("please enter a valid credentials")
    }

    const user = await loginService(validateInput.data)

    const token = generateAccessToken({id:user.id,email:user.email});

    return res.json({
        message:"login successful",
        user,
        token
    })
    
    }catch(error){
        return res.status(400).json("something went wrong");
    }
}

export const RegisterController= async(req : Request, res:Response)=>{
    try{
        const validateInput = registerSchema.safeParse(req.body);

        if(!validateInput.success){
            return res.status(400).json({
                message:"all fields are required and must be valid"
            })
        }

        const user = await registerService(validateInput.data);
        const token = generateAccessToken({id:user.id,email:user.email});

        return res.status(201).json({
            message: "User registered successfully",
            user,
            token
        })

    }catch{
        return res.status(500).json({message:"server error"})
    }
}