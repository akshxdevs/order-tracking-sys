import { Kafka } from "kafkajs";
import { KAFKA_BROKER } from "../config";

export const kafka = new Kafka({
    clientId: "order-service",
    brokers: [KAFKA_BROKER],
});

export const TOPICS = {
    ORDER_STATUS_UPDATE: "order-status-update",
} as const;
