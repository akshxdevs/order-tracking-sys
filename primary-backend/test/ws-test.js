import { io } from "socket.io-client";
const socket = io("http://localhost:3000");

socket.on("connect", async() => {
  console.log("Connected:", socket.id);
  socket.emit("join-order", "d7e98d72-a217-4f9f-b759-aa1f62b98d1d");

  socket.on("order-status-update", (data) => {
    console.log("Order Status Update live:", data);
  });
});

socket.on("disconnect", () => {
  console.log("Disconnected");
});
