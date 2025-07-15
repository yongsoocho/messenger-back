import { Router } from "express";
import { PrismaClient } from "./../../prisma/generated/mongo-prisma/index.js";
import { upload } from "./../middleware/multer.middleware.js";

export const ChatRouter = Router();
const prisma = new PrismaClient();

const url = "http://localhost:8080/uploads";

ChatRouter.get("/", async (req, res) => {
	const { roomId } = req.query;
	if (!roomId) {
		return res.status(400).json({ error: "Room ID is required" });
	}

	const messages = await prisma.message.findMany({
		where: { roomId },
		orderBy: { createdAt: "asc" },
	});

	return res.json(messages);
});

ChatRouter.post("/", async (req, res) => {
	const io = req.app.get("io");

	const { roomId, content } = req.body;

	const msg = await prisma.message.create({
		data: {
			roomId,
			content,
			sender: req.user.email,
		},
	});
	console.log(msg, roomId);
	io.to(roomId).emit("message", msg);
	return res.status(201).json(msg);
});

ChatRouter.post("/image", upload.single("chatimage"), async (req, res) => {
	const io = req.app.get("io");
	const { roomId } = req.body;

	const content = `${url}/${req.file.filename}`;

	const msg = await prisma.message.create({
		data: {
			roomId,
			content,
			sender: req.user.email,
			type: "IMAGE",
		},
	});
	console.log("hi");
	io.to(roomId).emit("message", msg);

	return res.status(201).json(msg);
});
