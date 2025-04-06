import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Connected:", socket.id);

  socket.emit("join-order", "07ca8b09-5147-4b05-9700-e7bc2466ea03");

  socket.on("order-status-update", (data) => {
    console.log("Order Status Update:", data);
  });
});

socket.on("disconnect", () => {
  console.log("Disconnected");
});
