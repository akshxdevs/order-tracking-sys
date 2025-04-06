import { Router } from "express";
import { prismaClient } from "./db/db";
import { publishOrderStatus } from "./kafka/producer";
import { OrderStatus } from "@prisma/client";
import { statusSchema } from "../types";

const router = Router();

router.post("/orders",async(req,res)=>{
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
export const orderRouter = router;