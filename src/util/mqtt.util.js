import mqtt from "mqtt";
import { PrismaClient as MongoPrismaClient } from "../../prisma/generated/mongo-prisma/index.js";

const mongoClient = new MongoPrismaClient();

export function initMqttClient() {
	const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL);

	mqttClient.on("connect", () => {
		console.log("Connected to MQTT broker");
		mqttClient.subscribe("room/#", (err) => {
			if (err) {
				console.error("Failed to subscribe to room topic:", err);
			}
		});
	});

	mqttClient.on("message", async (topic, message) => {
		const roomId = topic.split("/")[1];
		const { email, content } = JSON.parse(message.toString());

		await mongoClient.message.create({
			data: {
				roomId: roomId,
				senderEmail: email,
				type: "TEXT",
				content,
			},
		});
	});

	return mqttClient;
}
