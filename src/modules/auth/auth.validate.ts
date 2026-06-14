import {z} from "zod";

const loginSchema = z.object({
    email: z.string().email("invalid email address"),
    password: z.string().min(5,"password must be at least 5 characters long"),
})

const registerSchema = loginSchema.extend({
    name : z.string().min(5,"username is Required"),
    phone : z.string().min(10,"phone number must be at least 10 characters long"),
    address: z.string().min(5, "address must be at least 5 characters long"),
    // gender : z.enum(["male",'female',"other"])
})

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export {loginSchema,registerSchema};