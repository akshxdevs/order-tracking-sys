"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const socket = (0, socket_io_client_1.io)("http://localhost:3000");
socket.on("connect", () => {
    console.log("Connected:", socket.id);
    const orderId = yield prismaC;
    socket.emit("join-order", "d7e98d72-a217-4f9f-b759-aa1f62b98d1d");
    socket.on("order-status-update", (data) => {
        console.log("Order Status Update:", data);
    });
});
socket.on("disconnect", () => {
    console.log("Disconnected");
});
