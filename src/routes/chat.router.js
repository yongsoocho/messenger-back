import { Router } from "express";
import { PrismaClient } from "../../prisma/generated/mongo-prisma/index.js";
import { upload } from "./../middleware/multer.middleware.js";

export const ChatRouter = Router();
const prisma = new PrismaClient();

const url = "http://localhost:8080/uploads";

ChatRouter.get("/", async (req, res) => {
	const { roomId } = req.query;
	if (!roomId) {
		return res.status(400).json({ error: "Room ID is required" });
	}

	try {
		const messages = await prisma.chatMessage.findMany({
			where: { roomId },
			orderBy: { createdAt: "asc" },
		});
		return res.json(messages);
	} catch (error) {
		console.error("Error fetching chat messages:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
});
ChatRouter.post("/", async (req, res) => {
	const io = req.app.get("io");
	const { roomId, email, content } = req.body;

	const msg = await prisma.message.create({
		data: { roomId, sender: email, content },
	});

	io.to(roomId).emit("message", msg);

	return res.status(201).json(msg);
});
ChatRouter.post("/image", upload.single("image"), async (req, res) => {
	const io = req.app.get("io");
	const { roomId, email } = req.body;

	const content = `${url}/${req.file?.filename}`;

	const msg = await prisma.message.create({
		data: { roomId, sender: email, content, type: "IMAGE" },
	});

	io.to(roomId).emit("message", msg);

	return res.status(201).json(msg);
});
