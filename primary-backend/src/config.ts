import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 3000;
export const JWT_SECRET = process.env.JWT_SECRET || "akshxSEcert";
export const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
export const KAFKA_BROKER = process.env.KAFKA_BROKER || "localhost:9092";
