import express from "express";
import cors from "cors";
import { PORT } from "./configt";
import { userRouter } from "./routes/user";
import { setUpWebSocket } from "./routes/socket";
import http from "http"
import { listenOrderUpdateStatus } from "./routes/kafka/consumer";
import { orderRouter } from "./routes/order";
const app = express();
const server = http.createServer(app);
const ws = setUpWebSocket(server);

app.use(express.json());
app.use(cors());

app.use("/api/v1/user",userRouter);
app.use("/api/v1",orderRouter);

listenOrderUpdateStatus(ws);
server.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`);
})