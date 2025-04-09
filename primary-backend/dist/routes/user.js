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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const db_1 = require("./db/db");
const ioredis_1 = __importDefault(require("ioredis"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const configt_1 = require("../configt");
const router = (0, express_1.Router)();
const redis = new ioredis_1.default();
const OTP_LIMIT = 3;
const OTP_EXPIRY = 100;
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phoneNo } = req.body;
        const generateOtp = String((Math.floor(Math.random() * 1000000))).padStart(6, "7");
        const optKey = `otp:${String(phoneNo)}`;
        const otpReqCnts = yield redis.get(`otp_counts:${phoneNo}`);
        if (otpReqCnts && Number(otpReqCnts) >= OTP_LIMIT) {
            res.json({ message: "Too Many request!!" });
        }
        yield redis.setex(optKey, OTP_EXPIRY, generateOtp);
        yield redis.incr(`otp_count:${phoneNo}`);
        yield redis.expire(`opt_count:${phoneNo}`, OTP_EXPIRY);
        res.json({ message: `Otp: ${generateOtp} Generated Sucessfully for ${phoneNo}` });
    }
    catch (error) {
        res.status(411).json({ message: "Something Went Wrong!!" });
    }
}));
router.post("/login/customer/verify-otp", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phoneNo, userRole, otp, } = req.body;
        const role = String(userRole).toLocaleLowerCase();
        const generateUsername = String(role + (Math.floor(Math.random() * 1000000))).padStart(6, "7");
        if (!phoneNo || !otp) {
            return res.status(403).json({ message: "Invalid inputs!" });
        }
        const storedOtp = yield redis.get(`otp:${phoneNo}`);
        console.log(storedOtp);
        if (!storedOtp || storedOtp !== otp) {
            return res.status(401).json({ message: "Invalid or expired OTP!" });
        }
        const existingUser = yield db_1.prismaClient.user.findFirst({
            where: {
                phoneNo: phoneNo
            }
        });
        console.log(userRole);
        if (existingUser) {
            const userToken = jsonwebtoken_1.default.sign({
                id: existingUser === null || existingUser === void 0 ? void 0 : existingUser.id
            }, configt_1.JWT_SECRET, { expiresIn: '7d' });
            yield redis.del(`otp:${phoneNo}`);
            yield redis.del(`otp_count:${phoneNo}`);
            res.json({
                message: "User Login Successfully!",
                token: userToken,
                user: existingUser
            });
        }
        if (!existingUser) {
            const user = yield db_1.prismaClient.user.create({
                data: {
                    username: generateUsername,
                    userRole: userRole,
                    phoneNo: phoneNo
                }
            });
            const token = jsonwebtoken_1.default.sign({
                id: user.id
            }, configt_1.JWT_SECRET, { expiresIn: '7d' });
            yield redis.del(`otp:${phoneNo}`);
            yield redis.del(`otp_count:${phoneNo}`);
            return res.json({
                message: "User Login Successfully!",
                token: token,
                user: user
            });
        }
    }
    catch (error) {
        res.status(411).json({ message: "Something Went Wrong!!" });
    }
}));
router.post("/login/delivery/verify-otp", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phoneNo, otp, userRole } = req.body;
        const role = String(userRole).toLocaleLowerCase();
        const generateUsername = String(role + (Math.floor(Math.random() * 1000000))).padStart(6, "7");
        if (!phoneNo || !otp) {
            return res.status(403).json({ message: "Invalid inputs!" });
        }
        const storedOtp = yield redis.get(`otp:${phoneNo}`);
        console.log(storedOtp);
        if (!storedOtp || storedOtp !== otp) {
            return res.status(401).json({ message: "Invalid or expired OTP!" });
        }
        const existingDelivery = yield db_1.prismaClient.deliveryAgent.findFirst({
            where: {
                phoneNo: phoneNo,
            }, include: {
                orders: true
            }
        });
        if (existingDelivery) {
            yield db_1.prismaClient.deliveryAgent.update({
                where: { id: existingDelivery.id }, data: {
                    isOnline: true
                }
            });
            const deliveryToken = jsonwebtoken_1.default.sign({
                id: existingDelivery === null || existingDelivery === void 0 ? void 0 : existingDelivery.id
            }, configt_1.JWT_SECRET, { expiresIn: '7d' });
            yield redis.del(`otp:${phoneNo}`);
            yield redis.del(`otp_count:${phoneNo}`);
            res.json({
                message: "Delivery Login Successfully!",
                token: deliveryToken,
                delivery: existingDelivery
            });
        }
        if (!existingDelivery) {
            const delivery = yield db_1.prismaClient.deliveryAgent.create({
                data: {
                    phoneNo: phoneNo,
                    name: generateUsername,
                    isOnline: true
                }
            });
            const deliveryToken = jsonwebtoken_1.default.sign({
                id: delivery.id
            }, configt_1.JWT_SECRET, { expiresIn: '7d' });
            yield redis.del(`otp:${phoneNo}`);
            yield redis.del(`otp_count:${phoneNo}`);
            return res.json({
                message: "Delivery Login Successfully!",
                token: deliveryToken,
                delivery: delivery
            });
        }
    }
    catch (error) {
        res.status(411).json({ message: "Something Went Wrong!!" });
    }
}));
router.post("/login/admin/verify-otp", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phoneNo, userRole, otp, } = req.body;
        const role = String(userRole).toLocaleLowerCase();
        const generateUsername = String(role + (Math.floor(Math.random() * 1000000))).padStart(6, "7");
        if (!phoneNo || !otp) {
            return res.status(403).json({ message: "Invalid inputs!" });
        }
        const storedOtp = yield redis.get(`otp:${phoneNo}`);
        console.log(storedOtp);
        if (!storedOtp || storedOtp !== otp) {
            return res.status(401).json({ message: "Invalid or expired OTP!" });
        }
        const existingRestaurent = yield db_1.prismaClient.restaurent.findFirst({
            where: {
                resPhoneNo: phoneNo,
            }
        });
        if (existingRestaurent) {
            const restaurentToken = jsonwebtoken_1.default.sign({
                id: existingRestaurent === null || existingRestaurent === void 0 ? void 0 : existingRestaurent.id
            }, configt_1.JWT_SECRET, { expiresIn: '7d' });
            yield redis.del(`otp:${phoneNo}`);
            yield redis.del(`otp_count:${phoneNo}`);
            res.json({
                message: "Restaurent Login Successfully!",
                token: restaurentToken,
                restaurent: existingRestaurent
            });
        }
        if (!existingRestaurent) {
            const admin = yield db_1.prismaClient.restaurent.create({
                data: {
                    resName: generateUsername,
                    resPhoneNo: phoneNo
                }
            });
            const adminToken = jsonwebtoken_1.default.sign({
                id: admin.id
            }, configt_1.JWT_SECRET, { expiresIn: '7d' });
            yield redis.del(`otp:${phoneNo}`);
            yield redis.del(`otp_count:${phoneNo}`);
            return res.json({
                message: "Restaurent Login Successfully!",
                token: adminToken,
                admin: admin
            });
        }
    }
    catch (error) {
        res.status(411).json({ message: "Something Went Wrong!!" });
    }
}));
exports.userRouter = router;
