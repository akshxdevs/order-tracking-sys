    import { Router } from "express";
    import { prismaClient } from "./db/db";
    import Redis from "ioredis";
    import jwt from "jsonwebtoken";
    import { JWT_SECRET } from "../configt";
    const router = Router();
    const redis = new Redis();
    const OTP_LIMIT = 3;
    const OTP_EXPIRY = 100;
    router.post("/login",async(req,res)=>{
        try {
            const {phoneNo} = req.body;
            const generateOtp:string = String((Math.floor(Math.random()*1000000))).padStart(6,"7"); 
            const optKey = `otp:${String(phoneNo)}`
            const otpReqCnts = await redis.get(`otp_counts:${phoneNo}`)
            if (otpReqCnts && Number(otpReqCnts) >= OTP_LIMIT ) {
                res.json({message:"Too Many request!!"})
            }
            await redis.setex(optKey,OTP_EXPIRY,generateOtp);
            await redis.incr(`otp_count:${phoneNo}`);
            await redis.expire(`opt_count:${phoneNo}`,OTP_EXPIRY)
            res.json({message:`Otp: ${generateOtp} Generated Sucessfully for ${phoneNo}`})
        } catch (error) {
            res.status(411).json({message:"Something Went Wrong!!"})
        }
    });
    router.post("/login/verify-otp",async(req,res)=>{
        try {
            const {phoneNo,userRole,otp,name,restaurentName} = req.body;
            const role = String(userRole).toLocaleLowerCase();
            const generateUsername:string = String(role + (Math.floor(Math.random()*1000000))).padStart(6,"7");
            if (!phoneNo || !otp) {
                return res.status(403).json({message:"Invalid inputs!"})
            }
            const storedOtp = await redis.get(`otp:${phoneNo}`);
            console.log(storedOtp);
            if (!storedOtp || storedOtp !== otp) {
                return res.status(401).json({ message: "Invalid or expired OTP!" });
            }
            const existingUser = await prismaClient.user.findFirst({
                where:{
                    phoneNo:phoneNo
                }
            });
            if (existingUser) {
            const userToken = jwt.sign({
                id:existingUser?.id
            },JWT_SECRET as string,{expiresIn:'7d'}); 
            await redis.del(`otp:${phoneNo}`);
            await redis.del(`otp_count:${phoneNo}`);
            res.json({
                message:"User Login Successfully!",
                token:userToken,
                user:existingUser
            }); 
            }

            const existingRestaurent = await prismaClient.restaurent.findFirst({
                where:{
                    resPhoneNo:phoneNo,
                }
            })
            if (existingRestaurent) {
                const restaurentToken = jwt.sign({
                    id:existingUser?.id
                },JWT_SECRET as string,{expiresIn:'7d'}); 
                await redis.del(`otp:${phoneNo}`);
                await redis.del(`otp_count:${phoneNo}`);
                res.json({
                    message:"User Login Successfully!",
                    token:restaurentToken,
                    restaurent:existingRestaurent
                });   
            }
            const existingDelivery = await prismaClient.deliveryAgent.findFirst({
                where:{
                    phoneNo:phoneNo
                }
            });
            if (existingDelivery) {
                const deliveryToken = jwt.sign({
                    id:existingUser?.id
                },JWT_SECRET as string,{expiresIn:'7d'}); 
                await redis.del(`otp:${phoneNo}`);
                await redis.del(`otp_count:${phoneNo}`);
                res.json({
                    message:"User Login Successfully!",
                    token:deliveryToken,
                    delivery:existingDelivery
                });
            }
            if (!existingUser || !existingRestaurent || !existingDelivery) {
                switch (userRole) {
                    case "CUSTOMER":
                        const user = await prismaClient.user.create({
                            data:{
                                username:generateUsername,
                                userRole:userRole,
                                phoneNo:phoneNo
                            }
                        });
                        const token = jwt.sign({
                            id:user.id
                        },JWT_SECRET as string,{expiresIn:'7d'}); 
                        await redis.del(`otp:${phoneNo}`);
                        await redis.del(`otp_count:${phoneNo}`);
                        return res.json({
                            message:"User Login Successfully!",
                            token:token,
                            user:user
                        });  
                    case "DELIVERY":
                        const delivery = await prismaClient.deliveryAgent.create({
                            data:{
                                name:name,
                                phoneNo:phoneNo
                            }
                        });
                        const deliveryToken = jwt.sign({
                            id:delivery.id
                        },JWT_SECRET as string,{expiresIn:'7d'}); 
                        await redis.del(`otp:${phoneNo}`);
                        await redis.del(`otp_count:${phoneNo}`);
                        return res.json({
                            message:"User Login Successfully!",
                            token:deliveryToken,
                            delivery:delivery
                        });  
                    case "ADMIN":
                        const admin = await prismaClient.restaurent.create({
                            data:{
                                resName:restaurentName,
                            }
                        });
                        const adminToken = jwt.sign({
                            id:admin.id
                        },JWT_SECRET as string,{expiresIn:'7d'}); 
                        await redis.del(`otp:${phoneNo}`);
                        await redis.del(`otp_count:${phoneNo}`);
                        return res.json({
                            message:"User Login Successfully!",
                            token:adminToken,
                            admin:admin
                        });  
                    default:
                    return res.json({message:"Invalid role!"})
                } 
            }
        } catch (error) {
            res.status(411).json({message:"Something Went Wrong!!"})
        }
    })

    export const userRouter = router;