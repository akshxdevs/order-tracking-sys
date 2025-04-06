import { Server } from "socket.io";
import http from "http";

export const setUpWebSocket = (server: http.Server) => {
  const ws = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  ws.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    socket.on("join-order", (orderId: string) => {
      console.log(`Socket ${socket.id} joined room: ${orderId}`);
      socket.join(orderId);
    });

    socket.on("disconnect", () => {
      console.log("User Disconnected");
    });
  });

  return ws;
};
