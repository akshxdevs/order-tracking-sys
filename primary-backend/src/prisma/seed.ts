import { prismaClient } from "../lib/db";

async function main() {
    await prismaClient.restaurent.create({ data: { resName: "Burger Heaven" } });
    await prismaClient.user.create({ data: { name: "John", username: "john123", phoneNo: "1234567890" } });
    await prismaClient.deliveryAgent.create({ data: { name: "Bob", phoneNo: "9876543210" } });
    console.log("Seed data created successfully");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prismaClient.$disconnect();
    });
