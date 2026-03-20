import { OrderStatus } from "@prisma/client";
import { z } from "zod";

export const statusSchema = z.object({
    status: z.nativeEnum(OrderStatus),
});

export const loginSchema = z.object({
    phoneNo: z.string().min(1, "Phone number is required"),
});

export const verifyOtpSchema = z.object({
    phoneNo: z.string().min(1, "Phone number is required"),
    otp: z.string().length(6, "OTP must be 6 digits"),
});

export const customerVerifyOtpSchema = verifyOtpSchema.extend({
    userRole: z.enum(["CUSTOMER"]).default("CUSTOMER"),
});

export const orderItemSchema = z.object({
    name: z.string().min(1, "Item name is required"),
    quantity: z.number().int().positive("Quantity must be a positive integer"),
    price: z.number().int().positive("Price must be a positive integer"),
});

export const placeOrderSchema = z.object({
    restaurentId: z.string().uuid("Invalid restaurant ID"),
    totalPrice: z.number().int().positive("Total price must be a positive integer"),
    items: z.array(orderItemSchema).min(1, "At least one item is required"),
});

export const paginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});
