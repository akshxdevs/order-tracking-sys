import { Router } from "express";
import { prismaClient } from "./db/db";
import { publishOrderStatus } from "./kafka/producer";
import { OrderStatus } from "@prisma/client";
import { statusSchema } from "../types";
import { io } from "socket.io-client";

const router = Router();

router.post("/place-order",async(req,res)=>{
    try {
        const { restaurentId, userId, deliveryId, totalPrice, items } = req.body;
        const  [restaurent,user,delivery] = await Promise.all([
            prismaClient.restaurent.findUnique({where:{id:restaurentId}}),
            prismaClient.user.findUnique({where:{id:userId}}),
            prismaClient.deliveryAgent.findUnique({where:{id:deliveryId}}),
        ]);
        if (!restaurent) return res.status(404).json({message:"Invalid Restaurent Id!"});
        if (!user) return res.status(404).json({ message: "Invalid userId" });
        if (!delivery) return res.status(404).json({ message: "Invalid deliveryId" });

        const order = await prismaClient.order.create({
            data:{
                userId:userId,
                restaurentId:restaurentId,
                deliveryId:deliveryId,
                status:OrderStatus.PLACED,
                totalPrice:totalPrice,
                items:{
                    create: items.map((item:any) => ({
                        name:item.name,
                        quantity:item.quantity,
                        price:item.price
                    })),
                },
            },
            include:{
                items:true
            }
        })
        await publishOrderStatus(order.id,order.status);
        res.json({
            message:"Order Placed Successfully!!",
            order:order
        })
        if (!order) {
            res.status(402).json({message:"Invalid Order"})
        }
    } catch (error) {
        console.error(error);
        res.status(411).json({message:"Something Went Wrong!"})
    }
})

router.patch('/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const socket = io("http://localhost:3000");
        socket.on("connect", async() => {
        console.log("Connected:", socket.id);
        socket.emit("join-order", String(id));

        socket.on("order-status-update", (data) => {
            console.log("Order Status Update:", data);
        });
        });
        socket.on("disconnect", () => {
        console.log("Disconnected");
        });
        const parsedBody = statusSchema.safeParse(req.body);
        if (!parsedBody.success) return res.status(403).json({message:"Invalid Inputs",Error:parsedBody.error.errors})
        const order = await prismaClient.order.update({ where: { id }, data: { status:parsedBody.data.status } });
        await publishOrderStatus(order.id, order.status);
        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(411).json({message:"Something Went Wrong!"});
    }
  });
  router.get("/delivery/status/:id",async(req,res)=>{
    try {
        const id = req.params.id
        const getOrderStatus = await prismaClient.order.findFirst({
            where:{
                deliveryId:id
            }
        })
        if (getOrderStatus) {
            res.json({
                message:"Order Status Details fetched!!",
                details:getOrderStatus
            })
        }
    } catch (err) {
        console.error(err);
        res.status(411).json({message:"Something Went Wrong!"});
    }
  });
  router.get("/all-orders/status",async(req,res)=>{
    try {
        const getAllOrders = await prismaClient.order.findMany({
        })
        if (getAllOrders) {
            res.json({
                message:"Order Status Details fetched!!",
                details:getAllOrders
            })
        }
    } catch (err) {
        console.error(err);
        res.status(411).json({message:"Something Went Wrong!"});
    }
  });
  router.get("/delivery-available",async(req,res)=>{
    try {
        const deliveryAvailable = await prismaClient.deliveryAgent.findMany({
            where:{
                isOnline:true
            }
        })
        if (deliveryAvailable) {
            res.json({
                message:"Delivery Agent Ids fetched!!",
                details:deliveryAvailable
            })
        }
    } catch (err) {
        console.error(err);
        res.status(411).json({message:"Something Went Wrong!"});
    }
  });
  router.get("/restaurent-available",async(req,res)=>{
    try {
        const restaurentAvailable = await prismaClient.restaurent.findMany({
            where:{
                isOpen:true
            }
        })
        if (restaurentAvailable) {
            res.json({
                message:"Delivery Agent Ids fetched!!",
                details:restaurentAvailable
            })
        }
    } catch (err) {
        console.error(err);
        res.status(411).json({message:"Something Went Wrong!"});
    }
  });
  router.get("/orders/restaurent/:id/status",async(req,res)=>{
    try {
        const { id } = req.params
        const getOrders = await prismaClient.order.findMany({
            where:{
                restaurentId:id
            }
        })
        if (getOrders) {
            res.json({
                message:"Order Details fetched!!",
                orderDetails:getOrders
            })
        }
    } catch (err) {
        console.error(err);
        res.status(411).json({message:"Something Went Wrong!"});
    }
  });
  router.get("/orders/delivery/:id/status",async(req,res)=>{
    try {
        const { id } = req.params
        const getOrders = await prismaClient.order.findMany({
            where:{
                deliveryId:id
            }
        })
        if (getOrders) {
            res.json({
                message:"Order Details fetched!!",
                orderDetails:getOrders
            })
        }
    } catch (err) {
        console.error(err);
        res.status(411).json({message:"Something Went Wrong!"});
    }
  });
  router.get("/placed-orders",async(req,res)=>{
    try {
        const getOrders = await prismaClient.order.findMany({
            where:{
                status:"PLACED"
            }
        })
        if (getOrders) {
            res.json({
                message:"Orders fetched!!",
                orders:getOrders
            })
        }
    } catch (err) {
        console.error(err);
        res.status(411).json({message:"Something Went Wrong!"});
    }
  });
export const orderRouter = router;