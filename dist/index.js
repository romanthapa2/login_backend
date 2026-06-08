"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validation_using_zod_1 = require("./validation_using_zod");
const prisma_1 = require("./prisma");
const users_data_1 = require("./users_data");
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || "";
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.get("/", (req, res) => {
    res.json({
        message: "Backend is running",
        status: "ok",
    });
});
app.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validateData = validation_using_zod_1.loginSchema.safeParse(req.body);
        if (!validateData.success) {
            return res.status(400).json({ message: "email and password are required and must be valid" });
        }
        const { email, password } = validateData.data;
        const existingUser = yield prisma_1.prisma.user.findUnique({
            where: { email }
        });
        if (!existingUser || !(yield (0, users_data_1.verifyPassword)(password, existingUser.password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const token = jsonwebtoken_1.default.sign({
            id: existingUser.id,
            email: existingUser.email,
        }, JWT_SECRET, { expiresIn: "1d" });
        res.json({
            message: "Login successful",
            user: { id: existingUser.id, email: existingUser.email },
            token,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}));
app.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validateData = validation_using_zod_1.registerSchema.safeParse(req.body);
        if (!validateData.success) {
            return res.status(400).json({ message: "All fields are required and must be valid" });
        }
        const { email, password, phone, address, name } = validateData.data;
        const existingUser = yield prisma_1.prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }
        const hashedPassword = (0, users_data_1.hashPassword)(password);
        const newUser = yield prisma_1.prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                address,
                phone,
            },
        });
        const token = jsonwebtoken_1.default.sign({
            id: newUser.id,
            email: newUser.email,
        }, JWT_SECRET, { expiresIn: "1d" });
        res.status(201).json({
            message: "User registered successfully",
            user: { id: newUser.id, email: newUser.email },
            token
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}));
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
