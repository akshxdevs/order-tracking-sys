"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUpWebSocket = void 0;
const socket_io_1 = require("socket.io");
const setUpWebSocket = (server) => {
    const ws = new socket_io_1.Server(server, {
        cors: {
            origin: "*",
        },
    });
    ws.on("connection", (socket) => {
        console.log("User Connected:", socket.id);
        socket.on("join-order", (orderId) => {
            console.log(`Socket ${socket.id} joined room: ${orderId}`);
            socket.join(orderId);
        });
        socket.on("disconnect", () => {
            console.log("User Disconnected");
        });
    });
    return ws;
};
exports.setUpWebSocket = setUpWebSocket;
