"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const db_1 = require("../lib/db");
const redis_1 = require("../lib/redis");
const auth_1 = require("../lib/auth");
const asyncHandler_1 = require("../middleware/asyncHandler");
const types_1 = require("../types");
const router = (0, express_1.Router)();
const OTP_LIMIT = 3;
const OTP_EXPIRY = 100;
router.post("/login", (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsed = types_1.loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Validation failed", errors: parsed.error.errors });
    }
    const { phoneNo } = parsed.data;
    const otpCountKey = `otp_count:${phoneNo}`;
    const otpKey = `otp:${phoneNo}`;
    const otpReqCnts = yield redis_1.redis.get(otpCountKey);
    if (otpReqCnts && Number(otpReqCnts) >= OTP_LIMIT) {
        return res.status(429).json({ message: "Too many requests, try again later" });
    }
    const otp = (0, auth_1.generateOtp)();
    const pipeline = redis_1.redis.pipeline();
    pipeline.setex(otpKey, OTP_EXPIRY, otp);
    pipeline.incr(otpCountKey);
    if (!otpReqCnts) {
        pipeline.expire(otpCountKey, OTP_EXPIRY);
    }
    yield pipeline.exec();
    res.json({ message: `OTP generated successfully for ${phoneNo}` });
})));
router.post("/login/customer/verify-otp", (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsed = types_1.verifyOtpSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Validation failed", errors: parsed.error.errors });
    }
    const { phoneNo, otp } = parsed.data;
    const valid = yield (0, auth_1.verifyAndClearOtp)(phoneNo, otp);
    if (!valid) {
        return res.status(401).json({ message: "Invalid or expired OTP" });
    }
    const existingUser = yield db_1.prismaClient.user.findUnique({
        where: { phoneNo },
    });
    if (existingUser) {
        const token = (0, auth_1.generateToken)(existingUser.id, "customer");
        return res.json({
            message: "User login successful",
            token,
            user: existingUser,
        });
    }
    const user = yield db_1.prismaClient.user.create({
        data: {
            username: (0, auth_1.generateRandomName)("customer"),
            userRole: "CUSTOMER",
            phoneNo,
        },
    });
    const token = (0, auth_1.generateToken)(user.id, "customer");
    return res.json({
        message: "User registered and logged in successfully",
        token,
        user,
    });
})));
router.post("/login/delivery/verify-otp", (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsed = types_1.verifyOtpSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Validation failed", errors: parsed.error.errors });
    }
    const { phoneNo, otp } = parsed.data;
    const valid = yield (0, auth_1.verifyAndClearOtp)(phoneNo, otp);
    if (!valid) {
        return res.status(401).json({ message: "Invalid or expired OTP" });
    }
    const existingDelivery = yield db_1.prismaClient.deliveryAgent.findFirst({
        where: { phoneNo },
    });
    if (existingDelivery) {
        yield db_1.prismaClient.deliveryAgent.update({
            where: { id: existingDelivery.id },
            data: { isOnline: true },
        });
        const token = (0, auth_1.generateToken)(existingDelivery.id, "delivery");
        return res.json({
            message: "Delivery login successful",
            token,
            delivery: existingDelivery,
        });
    }
    const delivery = yield db_1.prismaClient.deliveryAgent.create({
        data: {
            phoneNo,
            name: (0, auth_1.generateRandomName)("delivery"),
            isOnline: true,
        },
    });
    const token = (0, auth_1.generateToken)(delivery.id, "delivery");
    return res.json({
        message: "Delivery registered and logged in successfully",
        token,
        delivery,
    });
})));
router.post("/login/admin/verify-otp", (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsed = types_1.verifyOtpSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Validation failed", errors: parsed.error.errors });
    }
    const { phoneNo, otp } = parsed.data;
    const valid = yield (0, auth_1.verifyAndClearOtp)(phoneNo, otp);
    if (!valid) {
        return res.status(401).json({ message: "Invalid or expired OTP" });
    }
    const existingRestaurent = yield db_1.prismaClient.restaurent.findFirst({
        where: { resPhoneNo: phoneNo },
    });
    if (existingRestaurent) {
        const token = (0, auth_1.generateToken)(existingRestaurent.id, "admin");
        return res.json({
            message: "Restaurant login successful",
            token,
            restaurent: existingRestaurent,
        });
    }
    const admin = yield db_1.prismaClient.restaurent.create({
        data: {
            resName: (0, auth_1.generateRandomName)("restaurant"),
            resPhoneNo: phoneNo,
        },
    });
    const token = (0, auth_1.generateToken)(admin.id, "admin");
    return res.json({
        message: "Restaurant registered and logged in successfully",
        token,
        restaurent: admin,
    });
})));
exports.userRouter = router;
