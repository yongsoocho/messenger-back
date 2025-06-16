import { Router } from "express";
import { asyncHandler } from "./../handler/async.handler.js";
import { PrismaClient } from "./../../prisma/generated/postgres-prisma/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const UserRouter = Router();
const prisma = new PrismaClient();

UserRouter.get("/profile", (req, res) => {
	const token = req.cookies.token;
	if (!token) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	const decoded = jwt.verify(token, process.env.JWT_SECRET);
	if (!decoded || !decoded.email) {
		return res.status(401).json({ message: "Unauthorized" });
	}
	res.json({ email: decoded.email, role: decoded.role });
});

UserRouter.post(
	"/signin",
	asyncHandler(async (req, res) => {
		const { email, password } = req.body;
		if (!email || !password) {
			return res
				.status(400)
				.json({ message: "Email and password are required" });
		}

		const user = await prisma.user.findUnique({
			where: { email },
		});
		if (!user)
			return res.status(401).json({ message: "Invalid email or password" });

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch)
			return res.status(401).json({ message: "Invalid email or password" });

		const token = jwt.sign(
			{ email: user.email, role: user.role },
			process.env.JWT_SECRET,
			{
				expiresIn: "15m",
			},
		);
		res.cookie("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 15 * 60 * 1000, // 15 minutes
		});
		return res.status(201).json({
			email: user.email,
			role: user.role,
		});
	}),
);

UserRouter.post(
	"/signup",
	asyncHandler(async (req, res) => {
		const { email, password } = req.body;
		if (!email || !password) {
			return res
				.status(400)
				.json({ message: "Email and password are required" });
		}

		const existingUser = await prisma.user.findUnique({
			where: { email },
		});
		if (existingUser) {
			return res.status(400).json({ message: "User already exists" });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = await prisma.user.create({
			data: {
				email,
				password: hashedPassword,
			},
		});

		const token = jwt.sign(
			{ email: newUser.email, role: newUser.role },
			process.env.JWT_SECRET,
			{
				expiresIn: "15m",
			},
		);
		res.cookie("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 15 * 60 * 1000, // 15 minutes
		});
		return res.status(201).json({
			email: newUser.email,
			role: newUser.role,
		});
	}),
);

UserRouter.post("/logout", (req, res) => {
	res.clearCookie("token");
	res.status(200).json({ message: "Logged out successfully" });
});
