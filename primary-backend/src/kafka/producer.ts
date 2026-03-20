import { kafka, TOPICS } from "../lib/kafka";

const producer = kafka.producer();

export const connectProducer = async () => {
    await producer.connect();
    console.log("Kafka producer connected");
};

export const disconnectProducer = async () => {
    await producer.disconnect();
};

export const publishOrderStatus = async (orderId: string, status: string) => {
    await producer.send({
        topic: TOPICS.ORDER_STATUS_UPDATE,
        messages: [
            { value: JSON.stringify({ orderId, status, updateAt: new Date().toISOString() }) },
        ],
    });
};
