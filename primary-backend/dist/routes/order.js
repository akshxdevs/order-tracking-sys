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
exports.orderRouter = void 0;
const express_1 = require("express");
const db_1 = require("../lib/db");
const producer_1 = require("../kafka/producer");
const client_1 = require("@prisma/client");
const types_1 = require("../types");
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = require("../middleware/asyncHandler");
const router = (0, express_1.Router)();
// Customer places an order (no deliveryId needed — auto-assigned on accept)
router.post("/place-order", auth_1.authMiddleware, (0, auth_1.requireRole)("customer"), (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsed = types_1.placeOrderSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Validation failed", errors: parsed.error.errors });
    }
    const { restaurentId, totalPrice, items } = parsed.data;
    const userId = req.userId;
    const [restaurent, user] = yield Promise.all([
        db_1.prismaClient.restaurent.findUnique({ where: { id: restaurentId } }),
        db_1.prismaClient.user.findUnique({ where: { id: userId } }),
    ]);
    if (!restaurent)
        return res.status(404).json({ message: "Invalid restaurant ID" });
    if (!user)
        return res.status(404).json({ message: "Invalid user ID" });
    if (!restaurent.isOpen)
        return res.status(400).json({ message: "Restaurant is currently closed" });
    const order = yield db_1.prismaClient.order.create({
        data: {
            userId,
            restaurentId,
            status: client_1.OrderStatus.PLACED,
            totalPrice,
            items: {
                create: items.map((item) => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                })),
            },
        },
        include: { items: true },
    });
    yield (0, producer_1.publishOrderStatus)(order.id, order.status);
    res.status(201).json({
        message: "Order placed successfully",
        order,
    });
})));
// Customer views their own orders
router.get("/my-orders", auth_1.authMiddleware, (0, auth_1.requireRole)("customer"), (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pagination = types_1.paginationSchema.safeParse(req.query);
    const { page, limit } = pagination.success ? pagination.data : { page: 1, limit: 20 };
    const orders = yield db_1.prismaClient.order.findMany({
        where: { userId: req.userId },
        include: { items: true, res: { select: { resName: true } } },
        orderBy: { placed_at: "desc" },
        skip: (page - 1) * limit,
        take: limit,
    });
    res.json({ message: "Your orders fetched", orders });
})));
// Customer cancels an order (only if PLACED — before restaurant accepts)
router.patch("/orders/:id/cancel", auth_1.authMiddleware, (0, auth_1.requireRole)("customer"), (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const userId = req.userId;
    const order = yield db_1.prismaClient.order.findUnique({ where: { id } });
    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }
    if (order.userId !== userId) {
        return res.status(403).json({ message: "This order does not belong to you" });
    }
    if (order.status !== client_1.OrderStatus.PLACED) {
        return res.status(400).json({ message: `Cannot cancel order with status ${order.status}. Only PLACED orders can be cancelled` });
    }
    const updated = yield db_1.prismaClient.order.update({
        where: { id },
        data: { status: client_1.OrderStatus.CANCELLED },
        include: { items: true },
    });
    yield (0, producer_1.publishOrderStatus)(updated.id, updated.status);
    res.json({ message: "Order cancelled successfully", order: updated });
})));
// Restaurant accepts an order — auto-assigns an available delivery agent
router.patch("/orders/:id/accept", auth_1.authMiddleware, (0, auth_1.requireRole)("admin"), (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const restaurentId = req.userId;
    const order = yield db_1.prismaClient.order.findUnique({ where: { id } });
    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }
    if (order.restaurentId !== restaurentId) {
        return res.status(403).json({ message: "This order does not belong to your restaurant" });
    }
    if (order.status !== client_1.OrderStatus.PLACED) {
        return res.status(400).json({ message: `Cannot accept order with status ${order.status}` });
    }
    // Auto-assign an available delivery agent
    const availableAgent = yield db_1.prismaClient.deliveryAgent.findFirst({
        where: { isOnline: true },
        orderBy: { orders: { _count: "asc" } },
    });
    if (!availableAgent) {
        return res.status(503).json({ message: "No delivery agents available right now. Try again later" });
    }
    const updated = yield db_1.prismaClient.order.update({
        where: { id },
        data: {
            status: client_1.OrderStatus.ACCEPTED,
            deliveryId: availableAgent.id,
        },
        include: { items: true, deliveryAgent: { select: { name: true, phoneNo: true } } },
    });
    yield (0, producer_1.publishOrderStatus)(updated.id, updated.status);
    res.json({ message: "Order accepted and delivery agent assigned", order: updated });
})));
// Restaurant rejects an order
router.patch("/orders/:id/reject", auth_1.authMiddleware, (0, auth_1.requireRole)("admin"), (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const restaurentId = req.userId;
    const order = yield db_1.prismaClient.order.findUnique({ where: { id } });
    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }
    if (order.restaurentId !== restaurentId) {
        return res.status(403).json({ message: "This order does not belong to your restaurant" });
    }
    if (order.status !== client_1.OrderStatus.PLACED) {
        return res.status(400).json({ message: `Cannot reject order with status ${order.status}` });
    }
    const updated = yield db_1.prismaClient.order.update({
        where: { id },
        data: { status: client_1.OrderStatus.REJECTED },
        include: { items: true },
    });
    yield (0, producer_1.publishOrderStatus)(updated.id, updated.status);
    res.json({ message: "Order rejected", order: updated });
})));
// Delivery agent updates order status (PICKED, DELIVERED)
router.patch("/orders/:id/status", auth_1.authMiddleware, (0, auth_1.requireRole)("delivery"), (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const deliveryId = req.userId;
    const parsedBody = types_1.statusSchema.safeParse(req.body);
    if (!parsedBody.success) {
        return res.status(400).json({ message: "Invalid status", errors: parsedBody.error.errors });
    }
    const allowedStatuses = [client_1.OrderStatus.PICKED, client_1.OrderStatus.DELIVERED];
    if (!allowedStatuses.includes(parsedBody.data.status)) {
        return res.status(400).json({ message: "Delivery agents can only set PICKED or DELIVERED" });
    }
    const order = yield db_1.prismaClient.order.findUnique({ where: { id } });
    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }
    if (order.deliveryId !== deliveryId) {
        return res.status(403).json({ message: "This order is not assigned to you" });
    }
    // Enforce status transitions: ACCEPTED→PICKED→DELIVERED
    if (parsedBody.data.status === client_1.OrderStatus.PICKED && order.status !== client_1.OrderStatus.ACCEPTED) {
        return res.status(400).json({ message: "Can only pick up ACCEPTED orders" });
    }
    if (parsedBody.data.status === client_1.OrderStatus.DELIVERED && order.status !== client_1.OrderStatus.PICKED) {
        return res.status(400).json({ message: "Can only deliver PICKED orders" });
    }
    const updated = yield db_1.prismaClient.order.update({
        where: { id },
        data: { status: parsedBody.data.status },
    });
    yield (0, producer_1.publishOrderStatus)(updated.id, updated.status);
    res.json({ message: "Order status updated", order: updated });
})));
// Restaurant views its incoming orders
router.get("/orders/restaurent/my-orders", auth_1.authMiddleware, (0, auth_1.requireRole)("admin"), (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pagination = types_1.paginationSchema.safeParse(req.query);
    const { page, limit } = pagination.success ? pagination.data : { page: 1, limit: 20 };
    const orders = yield db_1.prismaClient.order.findMany({
        where: { restaurentId: req.userId },
        include: { items: true, user: { select: { name: true, phoneNo: true } } },
        orderBy: { placed_at: "desc" },
        skip: (page - 1) * limit,
        take: limit,
    });
    res.json({ message: "Restaurant orders fetched", orders });
})));
// Delivery agent views their assigned orders
router.get("/orders/delivery/my-orders", auth_1.authMiddleware, (0, auth_1.requireRole)("delivery"), (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pagination = types_1.paginationSchema.safeParse(req.query);
    const { page, limit } = pagination.success ? pagination.data : { page: 1, limit: 20 };
    const orders = yield db_1.prismaClient.order.findMany({
        where: { deliveryId: req.userId },
        include: { items: true, res: { select: { resName: true } } },
        orderBy: { placed_at: "desc" },
        skip: (page - 1) * limit,
        take: limit,
    });
    res.json({ message: "Delivery orders fetched", orders });
})));
// Admin: list all orders
router.get("/all-orders/status", auth_1.authMiddleware, (0, auth_1.requireRole)("admin"), (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pagination = types_1.paginationSchema.safeParse(req.query);
    const { page, limit } = pagination.success ? pagination.data : { page: 1, limit: 20 };
    const orders = yield db_1.prismaClient.order.findMany({
        include: { items: true },
        orderBy: { placed_at: "desc" },
        skip: (page - 1) * limit,
        take: limit,
    });
    res.json({ message: "All orders fetched", orders });
})));
// Available delivery agents
router.get("/delivery-available", auth_1.authMiddleware, (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const agents = yield db_1.prismaClient.deliveryAgent.findMany({
        where: { isOnline: true },
    });
    res.json({ message: "Available delivery agents fetched", agents });
})));
// Available restaurants
router.get("/restaurent-available", auth_1.authMiddleware, (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const restaurants = yield db_1.prismaClient.restaurent.findMany({
        where: { isOpen: true },
    });
    res.json({ message: "Available restaurants fetched", restaurants });
})));
// Restaurant: view placed orders waiting for acceptance
router.get("/placed-orders", auth_1.authMiddleware, (0, auth_1.requireRole)("admin"), (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pagination = types_1.paginationSchema.safeParse(req.query);
    const { page, limit } = pagination.success ? pagination.data : { page: 1, limit: 20 };
    const orders = yield db_1.prismaClient.order.findMany({
        where: { status: client_1.OrderStatus.PLACED, restaurentId: req.userId },
        include: { items: true, user: { select: { name: true, phoneNo: true } } },
        orderBy: { placed_at: "desc" },
        skip: (page - 1) * limit,
        take: limit,
    });
    res.json({ message: "Placed orders fetched", orders });
})));
exports.orderRouter = router;
