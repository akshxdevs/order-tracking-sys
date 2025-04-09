import { BACKEND_URL } from "@/config";
import axios from "axios";
import { useState } from "react";

export const RestaurentComponent = () => {
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
                {showRestaurentModel && (
            <div className="fixed inset-0 bottom-0 top-0 bg-slate-600 backdrop-blur-sm bg-opacity-10 flex flex-col justify-center items-center">
                    <div>
                        <h1>Restaurent details</h1>
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">Order Live Status</h2>
                        {orders.map((order,index)=>(
                            <div key={index}>
                                <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
                                <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-4 font-medium text-gray-900">Order Id</th>
                                            <th scope="col" className="px-6 py-4 font-medium text-gray-900">Order Price</th>
                                            <th scope="col" className="px-6 py-4 font-medium text-gray-900">Order Status</th>
                                            <th scope="col" className="px-6 py-4 font-medium text-gray-900">Payment Methord</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 border-t border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 font-medium text-gray-900">{order.id}</th>
                                            <td className="px-6 py-4">{order.totalPrice} $</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-600">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                                                    <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                                    </svg>
                                                    <p className={`text-lg ${connected ? "text-green-600" : "text-red-500"}`}>
                                                        {status}
                                                    </p>
                                                </span>
                                                </td>
                                            <td className="px-6 py-4">UPI</td>
                                            <td className="flex justify-end gap-4 px-6 py-4 font-medium">
                                            <a href="">Delete</a>
                                            <a href="" className="text-primary-700">Edit</a></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        ))}
                        <div>
                            <p>Update Status:{updateStatus}</p>
                            <button className="font-normal border border-gray-600 p-2 hover:bg-gray-500 rounded-lg" onClick={()=>{
                                setUpdateStatus("Accepted")
                            }}>Accepted
                            </button>                        
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
        )}
    </div>
}