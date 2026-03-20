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
const http_1 = __importDefault(require("http"));
const config_1 = require("./config");
const user_1 = require("./routes/user");
const order_1 = require("./routes/order");
const socket_1 = require("./socket");
const consumer_1 = require("./kafka/consumer");
const producer_1 = require("./kafka/producer");
const db_1 = require("./lib/db");
const redis_1 = require("./lib/redis");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const ws = (0, socket_1.setUpWebSocket)(server);
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
app.use("/api/v1/user", user_1.userRouter);
app.use("/api/v1/order", order_1.orderRouter);
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Promise.all([(0, producer_1.connectProducer)(), (0, consumer_1.listenOrderUpdateStatus)(ws)]);
        server.listen(config_1.PORT, () => {
            console.log(`Server running on port ${config_1.PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
});
const shutdown = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Shutting down gracefully...");
    server.close();
    yield Promise.all([
        (0, producer_1.disconnectProducer)(),
        (0, consumer_1.disconnectConsumer)(),
        db_1.prismaClient.$disconnect(),
        redis_1.redis.quit(),
    ]);
    process.exit(0);
});
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
start();
