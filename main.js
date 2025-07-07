import express from "express";
import "dotenv/config";
import { Server } from "socket.io";
import { createServer } from "node:http";
import { UserRouter } from "./src/routes/user.router.js";
import { errorHandler, notFoundHandler } from "./src/handler/error.handler.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: "http://localhost:5173",
		credentials: true,
	},
});

async function bootstrap() {
	const PORT = process.env.PORT || 8000;

	app.use(
		cors({
			origin: "http://localhost:5173",
			credentials: true,
		}),
	);
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	app.use(cookieParser());

	app.use("/user", UserRouter);

	app.use(notFoundHandler);
	app.use(errorHandler);

	httpServer.listen(PORT, () => console.log(`server running on ${PORT}`));
}

await bootstrap();
