"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const configt_1 = require("./configt");
const user_1 = require("./routes/user");
const socket_1 = require("./routes/socket");
const http_1 = __importDefault(require("http"));
const consumer_1 = require("./routes/kafka/consumer");
const order_1 = require("./routes/order");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const ws = (0, socket_1.setUpWebSocket)(server);
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use("/api/v1/user", user_1.userRouter);
app.use("/api/v1/order", order_1.orderRouter);
(0, consumer_1.listenOrderUpdateStatus)(ws);
server.listen(configt_1.PORT, () => {
    console.log(`server running on port ${configt_1.PORT}`);
});
