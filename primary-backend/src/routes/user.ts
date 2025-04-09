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
    router.post("/login/customer/verify-otp",async(req,res)=>{
        try {
            const {phoneNo,userRole,otp,} = req.body;
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
            console.log(userRole);
            
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
            if (!existingUser) {
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
            }
        } catch (error) {
            res.status(411).json({message:"Something Went Wrong!!"})
        }
    })
    router.post("/login/delivery/verify-otp",async(req,res)=>{
        try {
            const {phoneNo,otp,userRole} = req.body;
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
            const existingDelivery = await prismaClient.deliveryAgent.findFirst({
                where:{
                    phoneNo:phoneNo,
                },include:{
                    orders:true
                }
            });
            if (existingDelivery) {
                await prismaClient.deliveryAgent.update({
                    where:{id:existingDelivery.id},data:{
                        isOnline:true
                    }
                })
                const deliveryToken = jwt.sign({
                    id:existingDelivery?.id
                },JWT_SECRET as string,{expiresIn:'7d'}); 
                await redis.del(`otp:${phoneNo}`);
                await redis.del(`otp_count:${phoneNo}`);
                res.json({
                    message:"Delivery Login Successfully!",
                    token:deliveryToken,
                    delivery:existingDelivery
                });
            }
            if (!existingDelivery) {
                const delivery = await prismaClient.deliveryAgent.create({
                    data:{
                        phoneNo:phoneNo,
                        name:generateUsername,
                        isOnline:true
                    }
                });
                const deliveryToken = jwt.sign({
                    id:delivery.id
                },JWT_SECRET as string,{expiresIn:'7d'}); 
                await redis.del(`otp:${phoneNo}`);
                await redis.del(`otp_count:${phoneNo}`);
                return res.json({
                    message:"Delivery Login Successfully!",
                    token:deliveryToken,
                    delivery:delivery
                });  
            }
        } catch (error) {
            res.status(411).json({message:"Something Went Wrong!!"})
        }
    })
    router.post("/login/admin/verify-otp",async(req,res)=>{
        try {
            const {phoneNo,userRole,otp,} = req.body;
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
            const existingRestaurent = await prismaClient.restaurent.findFirst({
                where:{
                    resPhoneNo:phoneNo,
                }
            })
            if (existingRestaurent) {
                const restaurentToken = jwt.sign({
                    id:existingRestaurent?.id
                },JWT_SECRET as string,{expiresIn:'7d'}); 
                await redis.del(`otp:${phoneNo}`);
                await redis.del(`otp_count:${phoneNo}`);
                res.json({
                    message:"Restaurent Login Successfully!",
                    token:restaurentToken,
                    restaurent:existingRestaurent
                });   
            }
            if (!existingRestaurent) {
                const admin = await prismaClient.restaurent.create({
                    data:{
                        resName:generateUsername,
                        resPhoneNo:phoneNo
                    }
                });
                const adminToken = jwt.sign({
                    id:admin.id
                },JWT_SECRET as string,{expiresIn:'7d'}); 
                await redis.del(`otp:${phoneNo}`);
                await redis.del(`otp_count:${phoneNo}`);
                return res.json({
                    message:"Restaurent Login Successfully!",
                    token:adminToken,
                    admin:admin
                }); 
            }
        } catch (error) {
            res.status(411).json({message:"Something Went Wrong!!"})
        }
    })

    export const userRouter = router;