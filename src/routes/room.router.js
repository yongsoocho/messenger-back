import { Router } from "express";
import { asyncHandler } from "./../handler/async.handler.js";
import { PrismaClient } from "./../../prisma/generated/postgres-prisma/index.js";

export const RoomRouter = Router();
const prisma = new PrismaClient();

RoomRouter.get(
	"/",
	asyncHandler(async (req, res) => {
		const user = req.user;
		const exUser = await prisma.user.findUnique({
			where: { email: user.email },
		});
		const rooms = await prisma.room.findMany({
			where: {
				OR: [{ fromUserId: exUser.id }, { toUserId: exUser.id }],
			},
			select: {
				id: true,
				lastMessage: true,
				updatedAt: true,
				toUser: {
					select: {
						email: true,
					},
				},
				fromUser: {
					select: {
						email: true,
					},
				},
			},
			orderBy: {
				updatedAt: "desc",
			},
		});

		return res.status(200).json(rooms);
	}),
);

RoomRouter.post(
	"/",
	asyncHandler(async (req, res) => {
		const user = req.user;
		const fromUser = await prisma.user.findUnique({
			where: { email: user.email },
		});
		const { email } = req.body;

		if (!email) {
			return res.status(400).json({ error: "toUserId is required" });
		}

		const toUser = await prisma.user.findUnique({
			where: { email },
			select: {
				id: true,
				email: true,
			},
		});
		const existingRoom = await prisma.room.findUnique({
			where: {
				toUserId_fromUserId: {
					toUserId: toUser.id,
					fromUserId: fromUser.id,
				},
			},
		});

		if (existingRoom) {
			return res.status(400).json({ error: "Already has been" });
		}

		const newRoom = await prisma.room.create({
			data: {
				fromUserId: fromUser.id,
				toUserId: toUser.id,
			},
			select: {
				id: true,
				lastMessage: true,
				updatedAt: true,
				toUser: {
					select: {
						email: true,
					},
				},
				fromUser: {
					select: {
						email: true,
					},
				},
			},
		});

		return res.status(201).json(newRoom);
	}),
);
