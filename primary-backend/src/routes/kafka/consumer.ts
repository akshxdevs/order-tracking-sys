import Redis from "ioredis";
import { Kafka } from "kafkajs";
import { Server } from "socket.io";

const redis = new Redis();
const kafka = new Kafka({
  clientId:'',
  brokers:['localhost:9092']
})

export const consumer = kafka.consumer({
  groupId:'order-group',
});

export const listenOrderUpdateStatus = async(io:Server) => {
  await consumer.connect();
  await consumer.subscribe({topic:'order-status-update',fromBeginning:false});
  consumer.run({
    eachMessage: async({message}) => {
      const data = JSON.parse(message.value!.toString());
      redis.set(`order:${data.orderId}`, data.status);
      io.to(data.orderId).emit('order-status-update',data)
    }
  })
}



