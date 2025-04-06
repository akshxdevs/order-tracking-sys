import { prismaClient } from "../routes/db/db";

async function Main(){
    await prismaClient.restaurent.create({ data: { resName: "Burger Heaven" } });
    await prismaClient.user.create({ data: { name: "John", username: "john123", phoneNo: "1234567890" } });
    await prismaClient.deliveryAgent.create({ data: { name: "Bob", phoneNo: "9876543210" } });
}

Main();