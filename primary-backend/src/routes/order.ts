import { Router } from "express";
import { prismaClient } from "../lib/db";
import { publishOrderStatus } from "../kafka/producer";
import { OrderStatus } from "@prisma/client";
import { statusSchema, placeOrderSchema, paginationSchema } from "../types";
import { authMiddleware, requireRole, AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

// Customer places an order (no deliveryId needed — auto-assigned on accept)
router.post("/place-order", authMiddleware, requireRole("customer"), asyncHandler(async (req: AuthRequest, res) => {
    const parsed = placeOrderSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Validation failed", errors: parsed.error.errors });
    }
    const { restaurentId, totalPrice, items } = parsed.data;
    const userId = req.userId!;

    const [restaurent, user] = await Promise.all([
        prismaClient.restaurent.findUnique({ where: { id: restaurentId } }),
        prismaClient.user.findUnique({ where: { id: userId } }),
    ]);

    if (!restaurent) return res.status(404).json({ message: "Invalid restaurant ID" });
    if (!user) return res.status(404).json({ message: "Invalid user ID" });
    if (!restaurent.isOpen) return res.status(400).json({ message: "Restaurant is currently closed" });

    const order = await prismaClient.order.create({
        data: {
            userId,
            restaurentId,
            status: OrderStatus.PLACED,
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

    await publishOrderStatus(order.id, order.status);
    res.status(201).json({
        message: "Order placed successfully",
        order,
    });
}));

// Customer views their own orders
router.get("/my-orders", authMiddleware, requireRole("customer"), asyncHandler(async (req: AuthRequest, res) => {
    const pagination = paginationSchema.safeParse(req.query);
    const { page, limit } = pagination.success ? pagination.data : { page: 1, limit: 20 };

    const orders = await prismaClient.order.findMany({
        where: { userId: req.userId! },
        include: { items: true, res: { select: { resName: true } } },
        orderBy: { placed_at: "desc" },
        skip: (page - 1) * limit,
        take: limit,
    });
    res.json({ message: "Your orders fetched", orders });
}));

// Customer cancels an order (only if PLACED — before restaurant accepts)
router.patch("/orders/:id/cancel", authMiddleware, requireRole("customer"), asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const userId = req.userId!;

    const order = await prismaClient.order.findUnique({ where: { id } });
    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }
    if (order.userId !== userId) {
        return res.status(403).json({ message: "This order does not belong to you" });
    }
    if (order.status !== OrderStatus.PLACED) {
        return res.status(400).json({ message: `Cannot cancel order with status ${order.status}. Only PLACED orders can be cancelled` });
    }

    const updated = await prismaClient.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED },
        include: { items: true },
    });

    await publishOrderStatus(updated.id, updated.status);
    res.json({ message: "Order cancelled successfully", order: updated });
}));

// Restaurant accepts an order — auto-assigns an available delivery agent
router.patch("/orders/:id/accept", authMiddleware, requireRole("admin"), asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const restaurentId = req.userId!;

    const order = await prismaClient.order.findUnique({ where: { id } });
    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }
    if (order.restaurentId !== restaurentId) {
        return res.status(403).json({ message: "This order does not belong to your restaurant" });
    }
    if (order.status !== OrderStatus.PLACED) {
        return res.status(400).json({ message: `Cannot accept order with status ${order.status}` });
    }

    // Auto-assign an available delivery agent
    const availableAgent = await prismaClient.deliveryAgent.findFirst({
        where: { isOnline: true },
        orderBy: { orders: { _count: "asc" } },
    });
    if (!availableAgent) {
        return res.status(503).json({ message: "No delivery agents available right now. Try again later" });
    }

    const updated = await prismaClient.order.update({
        where: { id },
        data: {
            status: OrderStatus.ACCEPTED,
            deliveryId: availableAgent.id,
        },
        include: { items: true, deliveryAgent: { select: { name: true, phoneNo: true } } },
    });

    await publishOrderStatus(updated.id, updated.status);
    res.json({ message: "Order accepted and delivery agent assigned", order: updated });
}));

// Restaurant rejects an order
router.patch("/orders/:id/reject", authMiddleware, requireRole("admin"), asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const restaurentId = req.userId!;

    const order = await prismaClient.order.findUnique({ where: { id } });
    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }
    if (order.restaurentId !== restaurentId) {
        return res.status(403).json({ message: "This order does not belong to your restaurant" });
    }
    if (order.status !== OrderStatus.PLACED) {
        return res.status(400).json({ message: `Cannot reject order with status ${order.status}` });
    }

    const updated = await prismaClient.order.update({
        where: { id },
        data: { status: OrderStatus.REJECTED },
        include: { items: true },
    });

    await publishOrderStatus(updated.id, updated.status);
    res.json({ message: "Order rejected", order: updated });
}));

// Delivery agent updates order status (PICKED, DELIVERED)
router.patch("/orders/:id/status", authMiddleware, requireRole("delivery"), asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const deliveryId = req.userId!;

    const parsedBody = statusSchema.safeParse(req.body);
    if (!parsedBody.success) {
        return res.status(400).json({ message: "Invalid status", errors: parsedBody.error.errors });
    }

    const allowedStatuses: OrderStatus[] = [OrderStatus.PICKED, OrderStatus.DELIVERED];
    if (!allowedStatuses.includes(parsedBody.data.status)) {
        return res.status(400).json({ message: "Delivery agents can only set PICKED or DELIVERED" });
    }

    const order = await prismaClient.order.findUnique({ where: { id } });
    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }
    if (order.deliveryId !== deliveryId) {
        return res.status(403).json({ message: "This order is not assigned to you" });
    }

    // Enforce status transitions: ACCEPTED→PICKED→DELIVERED
    if (parsedBody.data.status === OrderStatus.PICKED && order.status !== OrderStatus.ACCEPTED) {
        return res.status(400).json({ message: "Can only pick up ACCEPTED orders" });
    }
    if (parsedBody.data.status === OrderStatus.DELIVERED && order.status !== OrderStatus.PICKED) {
        return res.status(400).json({ message: "Can only deliver PICKED orders" });
    }

    const updated = await prismaClient.order.update({
        where: { id },
        data: { status: parsedBody.data.status },
    });
    await publishOrderStatus(updated.id, updated.status);
    res.json({ message: "Order status updated", order: updated });
}));

// Restaurant views its incoming orders
router.get("/orders/restaurent/my-orders", authMiddleware, requireRole("admin"), asyncHandler(async (req: AuthRequest, res) => {
    const pagination = paginationSchema.safeParse(req.query);
    const { page, limit } = pagination.success ? pagination.data : { page: 1, limit: 20 };

    const orders = await prismaClient.order.findMany({
        where: { restaurentId: req.userId! },
        include: { items: true, user: { select: { name: true, phoneNo: true } } },
        orderBy: { placed_at: "desc" },
        skip: (page - 1) * limit,
        take: limit,
    });
    res.json({ message: "Restaurant orders fetched", orders });
}));

// Delivery agent views their assigned orders
router.get("/orders/delivery/my-orders", authMiddleware, requireRole("delivery"), asyncHandler(async (req: AuthRequest, res) => {
    const pagination = paginationSchema.safeParse(req.query);
    const { page, limit } = pagination.success ? pagination.data : { page: 1, limit: 20 };

    const orders = await prismaClient.order.findMany({
        where: { deliveryId: req.userId! },
        include: { items: true, res: { select: { resName: true } } },
        orderBy: { placed_at: "desc" },
        skip: (page - 1) * limit,
        take: limit,
    });
    res.json({ message: "Delivery orders fetched", orders });
}));

// Admin: list all orders
router.get("/all-orders/status", authMiddleware, requireRole("admin"), asyncHandler(async (req: AuthRequest, res) => {
    const pagination = paginationSchema.safeParse(req.query);
    const { page, limit } = pagination.success ? pagination.data : { page: 1, limit: 20 };

    const orders = await prismaClient.order.findMany({
        include: { items: true },
        orderBy: { placed_at: "desc" },
        skip: (page - 1) * limit,
        take: limit,
    });
    res.json({ message: "All orders fetched", orders });
}));

// Available delivery agents
router.get("/delivery-available", authMiddleware, asyncHandler(async (req, res) => {
    const agents = await prismaClient.deliveryAgent.findMany({
        where: { isOnline: true },
    });
    res.json({ message: "Available delivery agents fetched", agents });
}));

// Available restaurants
router.get("/restaurent-available", authMiddleware, asyncHandler(async (req, res) => {
    const restaurants = await prismaClient.restaurent.findMany({
        where: { isOpen: true },
    });
    res.json({ message: "Available restaurants fetched", restaurants });
}));

// Restaurant: view placed orders waiting for acceptance
router.get("/placed-orders", authMiddleware, requireRole("admin"), asyncHandler(async (req: AuthRequest, res) => {
    const pagination = paginationSchema.safeParse(req.query);
    const { page, limit } = pagination.success ? pagination.data : { page: 1, limit: 20 };

    const orders = await prismaClient.order.findMany({
        where: { status: OrderStatus.PLACED, restaurentId: req.userId! },
        include: { items: true, user: { select: { name: true, phoneNo: true } } },
        orderBy: { placed_at: "desc" },
        skip: (page - 1) * limit,
        take: limit,
    });
    res.json({ message: "Placed orders fetched", orders });
}));

export const orderRouter = router;
