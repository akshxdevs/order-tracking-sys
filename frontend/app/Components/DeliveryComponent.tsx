import { BACKEND_URL } from "@/config";
import axios from "axios";
import { useState } from "react";

export const DeliveryComponent = () => {
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
                    <div>
                        <h1>Delivery details</h1>
                        <p>Status: <span>{statusMessage}</span></p>
                        <div>
                            <p>Update Status:{updateStatus}</p>
                            <button className="font-normal border border-gray-600 p-2 hover:bg-gray-500 rounded-lg" onClick={()=>{
                                setUpdateStatus("Picked")
                            }}>Picked</button>
                            <button className="font-normal border border-gray-600 p-2 hover:bg-gray-500 rounded-lg" onClick={()=>{
                                setUpdateStatus("Delivered")
                            }}>Delivered</button>

                        </div>                            
                        <button className="text-center font-normal border border-gray-600 p-2 hover:bg-gray-500 rounded-lg" onClick={async()=>{
                                const res = await axios.patch(`${BACKEND_URL}/order/orders/${orderId}/status`,{
                                    status:updateStatus.toLocaleUpperCase(),
                                });
                                if (res.data) {
                                    console.log(res.data);
                                }
                            }}>Update 🚀
                        </button>
                    </div>
                </div>
            </div>
    </div>
}