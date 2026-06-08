"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("invalid email address"),
    password: zod_1.z.string().min(5, "password must be at least 5 characters long"),
});
exports.loginSchema = loginSchema;
const registerSchema = loginSchema.extend({
    name: zod_1.z.string().min(5, "username is Required"),
    phone: zod_1.z.string().min(10, "phone number must be at least 10 characters long"),
    address: zod_1.z.string().min(5, "address must be at least 5 characters long"),
    gender: zod_1.z.enum(["male", 'female', "other"])
});
exports.registerSchema = registerSchema;
