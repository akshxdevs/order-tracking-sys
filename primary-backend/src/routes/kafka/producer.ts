import { Kafka } from "kafkajs";

const kafka = new Kafka({
    clientId:'order-service',
    brokers:['localhost:9092']
})

export const producer = kafka.producer();
export const publishOrderStatus = async(orderId:String,status:string)=>{
    await producer.connect();
    await producer.send({
        topic:'order-status-update',
        messages:[
            {value:JSON.stringify({orderId,status,updateAt:new Date().toString()})},
        ]
    });  
}

