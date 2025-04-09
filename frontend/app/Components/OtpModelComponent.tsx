import { BACKEND_URL } from "@/config";
import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export const OtpModelComponent = () => {
        const [showPorducts,setShowProducts] = useState(false);
        const [burgerCount,setBurgerCount] = useState(1);
        const [cokeCount,setCokeCount] = useState(1);
        const [pizzaCount,setPizzaCount] = useState(1);
        const [products,setProducts] = useState<any[]>([]);
        const [showCartModel, setShowCartModel] = useState(false);
        const [showLoginModel, setShowLoginModel] = useState(false);
        const [loginRole,setLoginRole] = useState("");
        const [showVerifyOtpModel,setShowVerifyOtpModel] = useState(false);
        const [phoneNo,setPhoneNo] = useState();
        const [otp,setOtp] = useState();
        const [showOtpModel, setShowOtpModel] = useState(false);
        const [showDeliveryModel,setShowDeliveryModel] = useState(false);
        const [showRestaurentModel,setShowRestaurentModel] = useState(false);
        const [userId,setUserId] = useState<string | null>(null);
        const [restaurentId,setRestaurentId] = useState<string | null>(null);
        const [deliveryId,setDeliveryId] = useState<string | null>(null);
        const [statusMessage,setStatusMessage] = useState<string>("");
        const [updateStatus,setUpdateStatus] = useState("");
        const [orderId,setOrderId] = useState("");
        const [status, setStatus] = useState<string>("Connecting...");
        const [connected, setConnected] = useState<boolean>(false);
        const [orders,setOrders] = useState<any[]>([]);
        const [delivery,setDelivery] = useState<any[]>([]);
        const totalPrice = products.reduce((cur,product)=>cur + product.price,0);
    
    return <div>
                    <div className="fixed inset-0 bottom-0 top-0 bg-slate-600 backdrop-blur-sm bg-opacity-10 flex flex-col justify-center items-center">
                <div className="bg-black p-10">
                    <div className="w-full border border-gray-700 rounded-lg">
                        <input className="p-2 bg-black rounded-lg" type="text" value={phoneNo} onChange={(e:any)=>setPhoneNo(e.target.value)} placeholder="Enter your mobile Number.."/>
                    </div>
                    <div className="py-2 text-center border border-gray-600 rounded-lg hover:bg-gray-600 my-2">
                        <button onClick={async()=>{
                            try {
                                const res = await axios.post(`${BACKEND_URL}/user/login`,{
                                    phoneNo,
                                });
                                if (res.data) {
                                    toast.success("Otp Generated Successfully!");
                                    setShowOtpModel(false);
                                    setShowVerifyOtpModel(true);
                                }
                            } catch (error) {
                                
                            }
                        }}>
                            Generate OTP
                        </button>
                    </div>
                </div>
            </div>
    </div>
}