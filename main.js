import express from "express";
import "dotenv/config";
import { Server } from "socket.io";
import { createServer } from "node:http";
import cookieParser from "cookie-parser";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: "*",
		credentials: true,
	},
});

async function bootstrap() {
	const PORT = process.env.PORT || 8000;

	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	app.use(cookieParser());
	
	app.use("/api/v1/user", UserRouter);
	
	app.use(notFoundHandler);
	app.use(errorHandler);

	httpServer.listen(PORT, () => console.log(`server running on ${PORT}`));
}

await bootstrap();
