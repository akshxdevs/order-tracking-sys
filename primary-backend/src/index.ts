import express from "express";
import cors from "cors";
import http from "http";
import { PORT } from "./config";
import { userRouter } from "./routes/user";
import { orderRouter } from "./routes/order";
import { setUpWebSocket } from "./socket";
import { listenOrderUpdateStatus, disconnectConsumer } from "./kafka/consumer";
import { connectProducer, disconnectProducer } from "./kafka/producer";
import { prismaClient } from "./lib/db";
import { redis } from "./lib/redis";

const app = express();
const server = http.createServer(app);
const ws = setUpWebSocket(server);

app.use(express.json());
app.use(cors());

app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

app.use("/api/v1/user", userRouter);
app.use("/api/v1/order", orderRouter);

const start = async () => {
    try {
        await Promise.all([connectProducer(), listenOrderUpdateStatus(ws)]);
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

const shutdown = async () => {
    console.log("Shutting down gracefully...");
    server.close();
    await Promise.all([
        disconnectProducer(),
        disconnectConsumer(),
        prismaClient.$disconnect(),
        redis.quit(),
    ]);
    process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

start();
