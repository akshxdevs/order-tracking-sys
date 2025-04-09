import { BACKEND_URL } from "@/config";
import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export const OtpVerifyModelComponent = () => {
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
        const getDeliveryOrders = async()=>{
            const res = await axios.get(`${BACKEND_URL}/order/orders/delivery/${deliveryId}/status`) 
            if (res.data) {
                console.log(res.data);
                setOrders(res.data.details);
            }
        } 
        const getRestaurentOrders = async()=>{
            const res = await axios.get(`${BACKEND_URL}/order/orders/delivery/${restaurentId}/status`) 
            if (res.data) {
                console.log(res.data);
                setOrders(res.data.details);
            }
        }
    return <div>
            <div className="fixed inset-0 bottom-0 top-0 bg-slate-600 backdrop-blur-sm bg-opacity-10 flex flex-col justify-center items-center">
                <div className="bg-black p-10">
                    <div className="w-full border border-gray-700 rounded-lg">
                        <input className="p-2 bg-black rounded-lg" type="text" value={otp} onChange={(e:any)=>setOtp(e.target.value)} placeholder="Enter your otp number.."/>
                    </div>
                    <div className="py-2 text-center border border-gray-600 rounded-lg hover:bg-gray-600 my-2">
                        <button onClick={async()=>{
                            try {
                                if (loginRole === "CUSTOMER") {
                                    const res = await axios.post(`${BACKEND_URL}/user/login/customer/verify-otp`,{
                                        phoneNo:phoneNo,
                                        userRole:String(loginRole),
                                        otp:otp,
                                    });
                                    if (res.data) {
                                        console.log(res.data);
                                        localStorage.setItem(`${loginRole}`,res.data.token);
                                        localStorage.setItem(`userId`,res.data.user.id);
                                        toast.success("Customer Login Successfully!");
                                        setShowVerifyOtpModel(false);
                                        setShowProducts(true);
                                    }
                                }else if (loginRole === "ADMIN") {
                                    const res = await axios.post(`${BACKEND_URL}/user/login/admin/verify-otp`,{
                                        phoneNo:phoneNo,
                                        userRole:String(loginRole),
                                        otp:otp,
                                    });
                                    if (res.data) {
                                        console.log(res.data);
                                        setShowVerifyOtpModel(false);
                                        setShowRestaurentModel(true);                                        
                                        toast.success("Restaurent Login Successfully!");
                                        localStorage.setItem(`${loginRole}`,res.data.token);
                                        localStorage.setItem("restaurentId",res.data.restaurent.id);
                                        getRestaurentOrders();
                                        }
                                }else if (loginRole === "DELIVERY") {
                                    const res = await axios.post(`${BACKEND_URL}/user/login/delivery/verify-otp`,{
                                        phoneNo:phoneNo,
                                        otp:otp,
                                        userRole:String(loginRole),
                                    });
                                    if (res.data) {
                                        console.log(res.data);
                                        setShowVerifyOtpModel(false);
                                        setShowDeliveryModel(true);
                                        toast.success("Delivery Login Successfully!");
                                        localStorage.setItem(`${loginRole}`,res.data.token);
                                        setStatusMessage(res?.data?.delivery?.orders?.[0]?.status);
                                        setOrderId(res?.data?.delivery?.orders?.[0]?.id);
                                        console.log(statusMessage);
                                        localStorage.setItem("deliveryId",res.data.delivery.id);
                                        getDeliveryOrders();
                                        }
                                }
                            } catch (error) {
                                console.error(error);
                                toast.error("Something Went Wrong!");
                            }
                        }}>
                            Login
                        </button>
                    </div>
                </div>
            </div>
    </div>
}