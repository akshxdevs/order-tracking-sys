"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationSchema = exports.placeOrderSchema = exports.orderItemSchema = exports.customerVerifyOtpSchema = exports.verifyOtpSchema = exports.loginSchema = exports.statusSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.statusSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.OrderStatus),
});
exports.loginSchema = zod_1.z.object({
    phoneNo: zod_1.z.string().min(1, "Phone number is required"),
});
exports.verifyOtpSchema = zod_1.z.object({
    phoneNo: zod_1.z.string().min(1, "Phone number is required"),
    otp: zod_1.z.string().length(6, "OTP must be 6 digits"),
});
exports.customerVerifyOtpSchema = exports.verifyOtpSchema.extend({
    userRole: zod_1.z.enum(["CUSTOMER"]).default("CUSTOMER"),
});
exports.orderItemSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Item name is required"),
    quantity: zod_1.z.number().int().positive("Quantity must be a positive integer"),
    price: zod_1.z.number().int().positive("Price must be a positive integer"),
});
exports.placeOrderSchema = zod_1.z.object({
    restaurentId: zod_1.z.string().uuid("Invalid restaurant ID"),
    totalPrice: zod_1.z.number().int().positive("Total price must be a positive integer"),
    items: zod_1.z.array(exports.orderItemSchema).min(1, "At least one item is required"),
});
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
