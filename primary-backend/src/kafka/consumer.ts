import { Server } from "socket.io";
import { redis } from "../lib/redis";
import { kafka, TOPICS } from "../lib/kafka";

const consumer = kafka.consumer({
    groupId: "order-group",
});

export const listenOrderUpdateStatus = async (io: Server) => {
    await consumer.connect();
    console.log("Kafka consumer connected");
    await consumer.subscribe({ topic: TOPICS.ORDER_STATUS_UPDATE, fromBeginning: false });
    await consumer.run({
        eachMessage: async ({ message }) => {
            const data = JSON.parse(message.value!.toString());
            await redis.set(`order:${data.orderId}`, data.status);
            io.to(data.orderId).emit(TOPICS.ORDER_STATUS_UPDATE, data);
        },
    });
};

export const disconnectConsumer = async () => {
    await consumer.disconnect();
};
