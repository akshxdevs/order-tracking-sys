import { useState } from "react";
import 'react-toastify/dist/ReactToastify.css';

export const LoginComponent = () => {
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
                    <h1 className="text-2xl font-semibold text-center py-2">Who are you?? 🤔</h1>
                    <div className="flex flex-row">
                        <div className="border rounded-lg p-2 mx-2"><button onClick={()=>{
                            setLoginRole("CUSTOMER");
                            setShowLoginModel(false);
                            setShowOtpModel(true);
                            }}>Customer</button></div>
                        <div className="border rounded-lg p-2 mx-2" onClick={()=>{
                            setLoginRole("ADMIN");
                            setShowLoginModel(false);
                            setShowOtpModel(true);
                            }}><button>Restaurent</button></div>
                        <div className="border rounded-lg p-2 mx-2" onClick={()=>{
                            setLoginRole("DELIVERY");
                            setShowLoginModel(false);
                            setShowOtpModel(true);
                            }}><button>Delivery Agent</button></div>
                    </div>
                </div>
            </div>
        </div>
}