import jwt from "jsonwebtoken";
import crypto from "crypto";
import { JWT_SECRET } from "../config";
import { redis } from "./redis";

export type Role = "customer" | "delivery" | "admin";

export const generateToken = (id: string, role: Role): string => {
    return jwt.sign({ id, role }, JWT_SECRET as string, { expiresIn: "7d" });
};

export const generateOtp = (): string => {
    return String(crypto.randomInt(0, 1000000)).padStart(6, "0");
};

export const verifyAndClearOtp = async (phoneNo: string, otp: string): Promise<boolean> => {
    const storedOtp = await redis.get(`otp:${phoneNo}`);
    if (!storedOtp || storedOtp !== otp) {
        return false;
    }
    await redis.del(`otp:${phoneNo}`, `otp_count:${phoneNo}`);
    return true;
};

export const generateRandomName = (prefix: string): string => {
    return `${prefix}_${crypto.randomInt(0, 1000000)}`;
};
