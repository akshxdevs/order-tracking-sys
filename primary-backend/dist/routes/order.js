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
const db_1 = require("./db/db");
const producer_1 = require("./kafka/producer");
const client_1 = require("@prisma/client");
const types_1 = require("../types");
const socket_io_client_1 = require("socket.io-client");
const router = (0, express_1.Router)();
router.post("/place-order", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { restaurentId, userId, deliveryId, totalPrice, items } = req.body;
        const [restaurent, user, delivery] = yield Promise.all([
            db_1.prismaClient.restaurent.findUnique({ where: { id: restaurentId } }),
            db_1.prismaClient.user.findUnique({ where: { id: userId } }),
            db_1.prismaClient.deliveryAgent.findUnique({ where: { id: deliveryId } }),
        ]);
        if (!restaurent)
            return res.status(404).json({ message: "Invalid Restaurent Id!" });
        if (!user)
            return res.status(404).json({ message: "Invalid userId" });
        if (!delivery)
            return res.status(404).json({ message: "Invalid deliveryId" });
        const order = yield db_1.prismaClient.order.create({
            data: {
                userId: userId,
                restaurentId: restaurentId,
                deliveryId: deliveryId,
                status: client_1.OrderStatus.PLACED,
                totalPrice: totalPrice,
                items: {
                    create: items.map((item) => ({
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price
                    })),
                },
            },
            include: {
                items: true
            }
        });
        yield (0, producer_1.publishOrderStatus)(order.id, order.status);
        res.json({
            message: "Order Placed Successfully!!",
            order: order
        });
        if (!order) {
            res.status(402).json({ message: "Invalid Order" });
        }
    }
    catch (error) {
        console.error(error);
        res.status(411).json({ message: "Something Went Wrong!" });
    }
}));
router.patch('/orders/:id/status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const socket = (0, socket_io_client_1.io)("http://localhost:3000");
        socket.on("connect", () => __awaiter(void 0, void 0, void 0, function* () {
            console.log("Connected:", socket.id);
            socket.emit("join-order", String(id));
            socket.on("order-status-update", (data) => {
                console.log("Order Status Update:", data);
            });
        }));
        socket.on("disconnect", () => {
            console.log("Disconnected");
        });
        const parsedBody = types_1.statusSchema.safeParse(req.body);
        if (!parsedBody.success)
            return res.status(403).json({ message: "Invalid Inputs", Error: parsedBody.error.errors });
        const order = yield db_1.prismaClient.order.update({ where: { id }, data: { status: parsedBody.data.status } });
        yield (0, producer_1.publishOrderStatus)(order.id, order.status);
        res.json(order);
    }
    catch (err) {
        console.error(err);
        res.status(411).json({ message: "Something Went Wrong!" });
    }
}));
router.get("/delivery/status/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const getOrderStatus = yield db_1.prismaClient.order.findFirst({
            where: {
                deliveryId: id
            }
        });
        if (getOrderStatus) {
            res.json({
                message: "Order Status Details fetched!!",
                details: getOrderStatus
            });
        }
    }
    catch (err) {
        console.error(err);
        res.status(411).json({ message: "Something Went Wrong!" });
    }
}));
router.get("/all-orders/status", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const getAllOrders = yield db_1.prismaClient.order.findMany({});
        if (getAllOrders) {
            res.json({
                message: "Order Status Details fetched!!",
                details: getAllOrders
            });
        }
    }
    catch (err) {
        console.error(err);
        res.status(411).json({ message: "Something Went Wrong!" });
    }
}));
router.get("/delivery-available", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deliveryAvailable = yield db_1.prismaClient.deliveryAgent.findMany({
            where: {
                isOnline: true
            }
        });
        if (deliveryAvailable) {
            res.json({
                message: "Delivery Agent Ids fetched!!",
                details: deliveryAvailable
            });
        }
    }
    catch (err) {
        console.error(err);
        res.status(411).json({ message: "Something Went Wrong!" });
    }
}));
router.get("/restaurent-available", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const restaurentAvailable = yield db_1.prismaClient.restaurent.findMany({
            where: {
                isOpen: true
            }
        });
        if (restaurentAvailable) {
            res.json({
                message: "Delivery Agent Ids fetched!!",
                details: restaurentAvailable
            });
        }
    }
    catch (err) {
        console.error(err);
        res.status(411).json({ message: "Something Went Wrong!" });
    }
}));
router.get("/orders/restaurent/:id/status", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const getOrders = yield db_1.prismaClient.order.findMany({
            where: {
                restaurentId: id
            }
        });
        if (getOrders) {
            res.json({
                message: "Order Details fetched!!",
                orderDetails: getOrders
            });
        }
    }
    catch (err) {
        console.error(err);
        res.status(411).json({ message: "Something Went Wrong!" });
    }
}));
router.get("/orders/delivery/:id/status", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const getOrders = yield db_1.prismaClient.order.findMany({
            where: {
                deliveryId: id
            }
        });
        if (getOrders) {
            res.json({
                message: "Order Details fetched!!",
                orderDetails: getOrders
            });
        }
    }
    catch (err) {
        console.error(err);
        res.status(411).json({ message: "Something Went Wrong!" });
    }
}));
router.get("/placed-orders", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const getOrders = yield db_1.prismaClient.order.findMany({
            where: {
                status: "PLACED"
            }
        });
        if (getOrders) {
            res.json({
                message: "Orders fetched!!",
                orders: getOrders
            });
        }
    }
    catch (err) {
        console.error(err);
        res.status(411).json({ message: "Something Went Wrong!" });
    }
}));
exports.orderRouter = router;
