import { Router } from "express";
import { prismaClient } from "../lib/db";
import { redis } from "../lib/redis";
import { generateToken, generateOtp, verifyAndClearOtp, generateRandomName } from "../lib/auth";
import { asyncHandler } from "../middleware/asyncHandler";
import { loginSchema, verifyOtpSchema } from "../types";

const router = Router();
const OTP_LIMIT = 3;
const OTP_EXPIRY = 100;

router.post("/login", asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Validation failed", errors: parsed.error.errors });
    }
    const { phoneNo } = parsed.data;

    const otpCountKey = `otp_count:${phoneNo}`;
    const otpKey = `otp:${phoneNo}`;

    const otpReqCnts = await redis.get(otpCountKey);
    if (otpReqCnts && Number(otpReqCnts) >= OTP_LIMIT) {
        return res.status(429).json({ message: "Too many requests, try again later" });
    }

    const otp = generateOtp();

    const pipeline = redis.pipeline();
    pipeline.setex(otpKey, OTP_EXPIRY, otp);
    pipeline.incr(otpCountKey);
    if (!otpReqCnts) {
        pipeline.expire(otpCountKey, OTP_EXPIRY);
    }
    await pipeline.exec();

    res.json({ message: `OTP generated successfully for ${phoneNo}` });
}));

router.post("/login/customer/verify-otp", asyncHandler(async (req, res) => {
    const parsed = verifyOtpSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Validation failed", errors: parsed.error.errors });
    }
    const { phoneNo, otp } = parsed.data;

    const valid = await verifyAndClearOtp(phoneNo, otp);
    if (!valid) {
        return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    const existingUser = await prismaClient.user.findUnique({
        where: { phoneNo },
    });

    if (existingUser) {
        const token = generateToken(existingUser.id, "customer");
        return res.json({
            message: "User login successful",
            token,
            user: existingUser,
        });
    }

    const user = await prismaClient.user.create({
        data: {
            username: generateRandomName("customer"),
            userRole: "CUSTOMER",
            phoneNo,
        },
    });
    const token = generateToken(user.id, "customer");
    return res.json({
        message: "User registered and logged in successfully",
        token,
        user,
    });
}));

router.post("/login/delivery/verify-otp", asyncHandler(async (req, res) => {
    const parsed = verifyOtpSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Validation failed", errors: parsed.error.errors });
    }
    const { phoneNo, otp } = parsed.data;

    const valid = await verifyAndClearOtp(phoneNo, otp);
    if (!valid) {
        return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    const existingDelivery = await prismaClient.deliveryAgent.findFirst({
        where: { phoneNo },
    });

    if (existingDelivery) {
        await prismaClient.deliveryAgent.update({
            where: { id: existingDelivery.id },
            data: { isOnline: true },
        });
        const token = generateToken(existingDelivery.id, "delivery");
        return res.json({
            message: "Delivery login successful",
            token,
            delivery: existingDelivery,
        });
    }

    const delivery = await prismaClient.deliveryAgent.create({
        data: {
            phoneNo,
            name: generateRandomName("delivery"),
            isOnline: true,
        },
    });
    const token = generateToken(delivery.id, "delivery");
    return res.json({
        message: "Delivery registered and logged in successfully",
        token,
        delivery,
    });
}));

router.post("/login/admin/verify-otp", asyncHandler(async (req, res) => {
    const parsed = verifyOtpSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Validation failed", errors: parsed.error.errors });
    }
    const { phoneNo, otp } = parsed.data;

    const valid = await verifyAndClearOtp(phoneNo, otp);
    if (!valid) {
        return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    const existingRestaurent = await prismaClient.restaurent.findFirst({
        where: { resPhoneNo: phoneNo },
    });

    if (existingRestaurent) {
        const token = generateToken(existingRestaurent.id, "admin");
        return res.json({
            message: "Restaurant login successful",
            token,
            restaurent: existingRestaurent,
        });
    }

    const admin = await prismaClient.restaurent.create({
        data: {
            resName: generateRandomName("restaurant"),
            resPhoneNo: phoneNo,
        },
    });
    const token = generateToken(admin.id, "admin");
    return res.json({
        message: "Restaurant registered and logged in successfully",
        token,
        restaurent: admin,
    });
}));

export const userRouter = router;
