import { BACKEND_URL } from "@/config";
import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
const ProductsComponent = () => {
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
        {showPorducts && (
            <div className="fixed inset-0 bottom-0 top-0 bg-slate-600 backdrop-blur-sm bg-opacity-10 flex flex-col justify-center items-center">
                <div className="bg-gray-900 p-10">
                    <div className="flex justify-end">
                        <button onClick={()=>{
                            setShowProducts(false);
                            setShowCartModel(true);
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"       stroke-width="1.5" stroke="currentColor" className="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                            </svg>
                        </button>
                        <p className="mt-3 text-sm font-light">{products.length}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="border border-gray-700 rounded-lg p-5">
                                <img className="mb-7 rounded-lg object-fill" src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUTEhMVFRUVFRUYFxcVFxYXFRUXFxYXFhUVFxUYHSggGBolHhYWITEhJSkrLi4uFyAzODMtNygtLisBCgoKDg0OGhAQGy0gHyYvLS0vLS0tLS0tLS0tLS8tKy0tLS0tKy8tLS0tLy0tLS0tNS0tLSstLS0tLy0tLS0tLf/AABEIALcBEwMBIgACEQEDEQH/xAAcAAABBQEBAQAAAAAAAAAAAAAEAAECAwUGBwj/xABAEAABAwIEAwUGBAQFAwUAAAABAAIRAyEEEjFBBQZREyJhcYEUMpGhsdEjQlLhBxXB8DNicpLxgqKyFkNEU9L/xAAaAQACAwEBAAAAAAAAAAAAAAAAAgEDBAUG/8QAMREAAgIBAgMECQUBAQAAAAAAAAECEQMEIRIxQQUiUaETFTJSYXGBkfBCscHR4RTx/9oADAMBAAIRAxEAPwDhs0WTgpmXN0aGiEo5Br7IYtkok0k5owEEA5aVJoKaSiWmApoAfKVZCuZUCi6sEANTpEp3UCE3bHZSbUJU0RYwclSpyUgLq4wNE1EFdQRZVFsKVUboZ7jKaiLJVVGmlUNlQ16miAvKFXlQ5qqYd1U0QO4TorW1nNVDakFPUqyigLqlTMq3shV0jdWuuigJ06sBQ1KYQpUngFQSM5RVtRwJUMqKCy0VDCZ9QQpBtkIHQbqKJsNwWEzXOisxrBoFZRxgDYCzq9SSVJBWNVMFVBqJbSQAzynwlMucITVFPC1cpQBouw56pLPqYwklJSA9NgdooVJBVNKqQr2tzXWctLe2UKjynpUeqlVpwgCEJZiihBaqKjYCkCBYVEKdOqntKlCk2NnRRAIKJw1YBQxTpNkyIIMoElKq2EVQqw26zcXjRoLn5BEpRirkTCEpuooTnqtxlRp0ydf2RlGkNFz8uva2ijr4Oyk95sop4aUbQ4bP5ZRFKlJsAtLCvcBaD/VcvNrcz/UdXHoMEf0oEZwhnQD0P2RVPhrNMh01/ZaFHE7kDaCQJkR/fqj2ZCfdvr6rnZNTk6t/c0rDCP6Uc+7gdMxGW/UtEed7Kl/LrcxGUOA6OsfUFdlh8gcIa2QJk6eRkK99Nh7xa0g6gWPjpfZLHX5oraT+5RPFhb70F9kefu5Y/SSPUFAV+AVWmxB+K9Up8IpvGbvAeBB+uyVblqASDPS31W/F2hrEuJbr8+pjnptFLZqmeOYjAVWe8w+l0M2ovX63CnCGuGvu3Dvr9Fh4/ltj5DmAHqLFasXbtOs0a+X9MzZOyYvfFP7/ANnACqFeysEbxTlepTuzvjp+b91jNtrYhdvBqceeN43Zyc2nyYXU1RqB0CVQQDdQ7a0KkOV7RRZbOysDFS0q41rKKJEHAKx1VCqaiibLAkqxIUtVNEWKElKEkUwKAVfTrQFUGKYaqS0sFQohl1QxqvpC6ghEi2E1YWU3gyneLIJYLRpnVNF0XQdZUgXToVk201bSIBlxgC5KYLK4tipORug18T0UTmoKxseN5JcKHx+OzuhgIb13P2SoUfBD0maiOi1KdIggaEa+i5GfK5O2ei0unjjWwqTLR0ReDp3Ft9EqGHJjx2131R1Oj0Gp26kLBkmdCKJm8kn0FhA2tsiX0srGkb6RPhuo9kTP9f7/ALlWteXUmjcSAN4kz5/ssjZYWAgEAd6R5QfNadClpGpN/AaoOjRBJmACNx5WWngLyTf6eX7rLkaoiUqQXgcNIcdSDb6wqcLWLnkASASJ8fPyWnhxGlgdtummnRSp4UB7oFiSbePRJwprbmY3l3dhGFMNABuBoPS99kQcQ8WnYEfKR8PmhMZRgkNd+UTFzmEbqqtRLm5Q6xHWbg2WtZJQ7vVeH2MvDGW76htOoKrCTG4I8d7aoZwDh35MDuuAGby8fuEXicQZacoBIuBuel/RX0cFAu6DvAHmR+6seOWR0t65/HwK+NQV8vA5+tw+0kf6Ta/QrmOYeVhWGZgy1BuND4OXpGFgki8NJ/YSVHEYIHWx2S48GTFWXBLceWojNcGRWj55xVF1NxY8Q5pgj+9QoMuvUOeOV+2pmowfiM6fmG7T/ReY0bFer0GsWqx3VSXNfnRnD1WD0Utt0+RYBCYImpUBVRhbqM1jAKxirJV9BshKSQJEpilUZdOxtkWAoSSSRYURv0KsfTLTDgQV3GA5L7StTp9plzE96JiASbdbKnnvlVuDfSa2rnzhxgtALYIE22M/JZpWmkXKmjkWSdldSaToFEuLbBTw9UhMQH4fBVHaNn4JVuH1Bq36Ld5T4xTp1CazS5pFrAwfJG8y8YpVCDSaQPID5KQOMFAjUKFbDOAzRZb2Ey1qrGaDfRGc50WUmNYzUwmQNHF43E5GEjU2HmVl4SjMSiOLu9ydLn1t9/mp0KrANfuufq8jukdPQQSXEwzD4YTB0JH1A/qfitBlEybXH1kD7IHDYwOsAXEdBO9tEbVrODmt7OpncRDS0gvm1hvJhcmam2dmMooKoUO8NLAR8P3WkKcHwHohRwXG2LsM8DYy37+K6ng3KT6jfxqrWno0ZzfqZEFZMkW2lfmD1GOKtswqbZBB/u//AAnpUoIjQRG831/otninK1djvwS1zYF3GDPlGiHwXAna4ioGeDL7frcPlCon3PadDrUY2rTshhmiACR4aXWhhwyAAdPr5I7D8u4QZZqOBubvAzeZi3pCIZwbC3c172gGPfEW8x/VUyxKe6kimWrg9t/sD0qzWAktzXMHbbbwui6HEaUe/EbWm9vUIJ+ApQQ/EjWDMR/tJ1SNPh7HBr6wdsCasA2m4aQIT4FJdV+fLcpySxPxb+H+h9KtSM94Enx1+6m2tSBDS9gPi4A/Vcw/CcPzODazwJ/K9pHoYkhOzheA17V4AN5eIPmYkJlJRe/7EOMPFnYVaAs6bC4OuylSrC4J0CAwYwjGZabyG2Nnkj/uJiVGhhqAeXMxDzb3ZFttYkq2WdKVxa+O5n4U007+GwaypFQ7B311CKrOEgGxket5ny+yF9jom/auPqJ+iHdwQF4f7RUme7ppuCN/OyIZZpNbO34+P55ivgb3bX0DcRRm3gvEOdeHihjKjQIa6Ht8na/MFe70sO4QCc3Q6H1ErzH+M/CiDRxABjvU32695nh+r4hdTs1uOdS5Xs/3X58TJqGpY650cBTak5iGpuKva8r0lnOomVZTqkKLGypEKCR83VPnUXaKKgBy5JVpIIPRKvMrabm1KZBcwyAdD1B8xK5zm3mx+OqtcWCm1jcrWg5tTJJMDw+CDwuCmwKnjuBOpjPsqpRTakWRdKjOD5VtNDAmUdgwDqpINbh9OQp1nbKeEYPkqqrod1UrmBby4JxLPCSiecw5+IAAkBo06m5QTHZH5wIO0eO6hxLHkj3jPTr56LDqtY8U1CCt+Rpw4FNcUnSKKvL9KqGmrVczLNmBpPzSqcMwFEtIdUqEXPaGx8wAJ8lktZVq6gwD+UsHzc7VVcVwtOnk7ziXAlzQ6mS3SPcP1hYXhzZHxTn9Fsa4ZscFwpHYM58o0j3aQFo7jWgWsLeSH4h/FAOj8N1tJi3leV5+/BFx3A6ST8VfQ4X0ak/4tPFd5t/Ul6l3sjrKn8VKxGVrCR4wgHfxBxmrWhp6yZ+SHw/C2NAL4H99FrYTlWpUGam0Ob1kR9VVJaLHu4r5sreol4mPX5w4hUmaxaDs0LLq1cQ+761V3m933Xc0OTazn5C0MjUmI9ANUncl1gCcoIBicw+PkiOt0sNo8K+xU8sn1OEp0KmuZ3xKJZRqH8zl6FS5LbDZeZHvWsfBvTzXRYblXDMBBY2S28mXDxBOh8VTl7XxLlv9BfSPxPH/AOWuOpPxKLwPKpquygQepBjw9V65geD0aGbJ+ZwkOIMAafAqePcwOBJEZR8RpHwWWXbE22oL8+QjyS8Tzal/DyuA4gtEAxDiC6NvBQHKuLZAy1JdplcSPUgwPVd+eLCCZtveAR0+ai3jDQfe8xr81X6x1T5pP6Eenl0Z55i+Xcew90VPAQD8HCyEqYbiNO57ZvpI+S9RbxUOJAfaLRBIt0GqsHE3s3FSdBp5FWR7Sy8pQi/oOtXJHlVHjePpakkeLT+y1OG8/wBdp70f933XpzMVTc0ONNs9InzhVVOB4SsHZqLHX0c0SCOhN/gj/rwZdp4l9P8AxDrWyAuXucHViM0x1DSV1PEcFTxeGfQqF2WoBJbANiHCCR1AWDh+XaNFwNNuQgbWkdD1Whi+IOpsllMvPTMGz5E2VOPN6LLxRTS6W/8AaHefFkjvszynmvkatgWCqXtqUi7LmbILSfdzNPXwK56iwkLo+e+YcZWf2dam6jRsW0zBDo/MXizr7DRYlOq0NXt9HKc8SlOr+G5gnw33eRW1SCra+VZKvsUk4qAEpRdWhwCggXYFJXe2BJTsBs8vuZRDnPJJ2sjOJceFSnlA+XwXRs5owHs7WkszZRbLoQLyYXC8R4hSe5zqYAElZpSVbmpYmuQKx7TqFd7LbM1Y54k0awtLhvFQWEWOqbiIWFsPwQLyG7roKfLb+zLyQIEi11zPCuKtp1mucBEmfUQuj4tzWx9NzWPgRGqHNJjw0sp8gPh3CqtUF4Ngsh1PvkObuQVu8t80MZQNLU3j13WDx3EZadR+hdYHpO6ScYZE3JCzhkwOnswHE8VbJp0mM/SX5QT45Tt5qXDeGNeblo6k7Dy3WLwlmc5WiTIAHif3VPG6bGy05jVNgGu0IN8wE5rSIteOkHFLTSe0XXmO4TriZ2mLwmEYwRWYHA3c86+AA0TDGtyZKFIOcdajyGj/AKQbwuF4Nwy+Z1v6eZ2WxiWsY3vEjxk38lVHs+K9uTl+fAIY295GnQ4XWfiBTq1KYDmuP4bgXCxLbG2sfFZB5hqYSqWh0wdWSLf5mm0oc1vZ8Q6DnbDYyExJaDqRsTB8vIoDilJz6tWrltIeYLZAMCYbaBIv4jRalp8cu7JKhsuPGod1bnonDv4gsfBe4AgAE+7O263Wc5Yc08nbNudyJG+3ovJeC4B1anUDab8ktBfHdBnTNoNvitlvCWUhFQBpAgAi8kS3u6xcE7wfFc3N2Pp3La0LDTuSuzvm8fw+UTXbY9bRfqfJNiObsLF6rTPiXekD0XnzeGvLf8RlVp2Mt22btAJ06lW/yVzGEsYQbQCQ5t9dBI00PXwuj7Gw83J+Qy0kup1PFObcgMNqu6EMAHxXLYrniq8nKx1h+a8eceKKpvq0MorNdTze6SDldAEgB3SRtutB+FpVw0ZWNJs57HEF0nQt0EeS04tDp8fOJZ/xrmjj6/MeJmJAO9jb5p8LjqlQ9+oT8lsV+W3NrBnYl17tl3e8LXOxtqn/APRdWmM73OjUtp957RMd6PdPVbVhx/pighijB2zZq8To0cLlpZXVnlpc+BmawC7Bmu5xcdW7DXZYdDm1x/xGPECZO/jBKPwNMU2RRY/t3vFxLy6iWghp2kkA2BN9tFa5jwAHtpHU/wCJS7SNTILs0+B9EZcGPIlxLcXJjUnZdg+c6UavA6QdVo4bmZjzYPHQkCDtOq51/CqTwXZbyZIO5uLDTfzWXWwFWkc1J8tB9QfHquZk7Nw9NiiWndbHodXjdanYO0vBO21jPVX4PmerYHL6kNn1svNMbxJhvlOe1w6AIFzounfh3A9TAnxMXKxZdHGCXFzZnfEuZ19TH0cQzLXoNe3zFj1BFwfFcfzXy/SpNFbDueGZgHU3wS2dC12pHgb31V+DYW2FpvHj5ITj/Ew4di0zcFx8R+VXdmxzQzqOJvh6rpRHMwGqyUsqZwXqgJZZUxRKswVjdaDCCUyRBmHDpIiqDJSRYUcEKrz+Y/FIYl4BAcYPilWkWUadOVnrxL3fJMgXnqrsNiHtMNcQnFJWUqV1JCu+YYajjq4qkuM6lO5yZuqV8jRiviW50PLNIkyUXzrjRlbRa3uzLnEaugw0emqI5aow2Vg86YqoK7Ng1vdI3BN1Ed0GpcVk23B6OOdTEtAlwLSRuD1nfxCqrOBdmyhsADYCwiSdyVnOxT3wJ0ECwWlgOHA5X1RmaTEA3JtY9Br8CkyVHdj4Zynsh6PEXAxTbnd6wOhKTqJNWk6s/OC6IEZR3iBF7gkT6ol/CD2jm0iWAtLiwyS0Agw7wsDKH4jhizKA3IWgEzOZ8nMHRtEjRLHInyHljklcv8/PmbHEMA959/uCMu4tJiJEQn4JwBxc7tnhrHA0yGEZnTBgDN7piCdBKzsLxEmBlcSNcostGnWxD2E0qZaBq9wuIgmG+Egz6pZSp7s1RhCVs66hzDQwdEUy2nIOVlKlq6RBzPggAkyXA7nWwXAYjG16j3Pc1pDie6zusZcmG2Ntfn4rpeXOEsqB9QvBz5g22Z7CQRcEzJE2B2PWULxcGjVe0hppPquAaJBBi3djpaY/NJE2CenjxcPUHgftLZGBUxtQR3ImIvM+R0KJr1MS2nLx2YOgcHNc7xE+eyrx+Erue1wYZaIAMmzczgL6mJA0mLBbVCvVqAUqs91rSA1nu6gG8ZXt7wzExuRaU6ae5W3KmmAcJqGs8NqvNaYAD3OzMIFw3Nb7wEXXNBrTkqFjwPce11iCe6QQYOnh5LKGEqU6rX/qLiQbEgOgkEm536rqK2Bo18rsS0k5QA4EtJHXMP6pZON78i3EpOO3NeYbwHnNrqYp1g8kaPa6HjUARa0EAwevWxuP4Xh8Rhi72mpRdu1ku7QkXaW2OWBu6JWEzlXDghzH4g2ES+m4zaRPZgEaha9HAspU4LKmWZDqtRrRMWjLlJHXW3RCyRTqxpYZSVtNMlwd/YtDKFJ4zAXPfqlosC60MbsGgSdSYiSH8DgdpVaNZjQx1dNvQeMxZA1OP0qcdk1ru8IbSBdc90HtHyQJJGYdSqOLMqy6viKoLWwRTBJaS0ZiJ94nKLE6RN4hS+9uyttLZczN4k8VXk4aq1nZWce+A49MzZjSxiDOupQXtdQH8UAG1wIb0aTFrxquko8PpwKj8tmnvtyiWhjjnL2CAC4EAXkNnewWI4e5wqV3VHdmWUwGODiMpj8xsYBzdL+cVd2CroQouRz3EeGNMvp2J1aNHE7+crSw/HajqTQWzUaDL9BA3I3d1RzeXq5o56GR4cJdSzRUZMxGa0W38YlYOoJNicpIJktgWvtY/IK2MMWauJXXiZNRipXRbiOI1HfndHQGB8lQxRYJVlFklb4QjFVFUc8nnUcysyCVB4gpqAm6okzEEKJhQUAE+0HokqQUlG4HI4kd4q3CtslicO5roeCD4o/B4SWyqWzSluUCkpsaphuyTdVKIKK7d0+EZJCd7JKNwWFMggbpJF+DnZ2XDobTAVfE+H067ctQaaEat8QqmVYACIa9OjNkk5O2ee8SwXYVjTzSBEHeCJutzl5+YtZAIu4lxADbRJJsNAoc7YQAsqjU90+lx/VB8LxTcj2vLpLQGZYyyXXz7xfZU6iNxL9JOpG9h6xoVC99NtRpdZxBgkyYIOsiPISp4ys2pRexzWkiGtDWXknvX1AAGn3WZhOJ5WZXHM2QYMawRp6qXDcTDzrAa4DqA4mRMdCQsLg1v1R0ozT26M6GlSZTwpaBNQHMCWuGdpYA0xHuhzRa8TtsJj+IPLqVOA0AFrnF+rXAyItAAmJg2Guis7OvUI9mp1agyOa9rWuqC+4Ab3DYI7h/K3EKzX1vZ3sfRpy1tUFrqhaPcaIzOkC3n4qqC3tj5MqXdujW4fQZTwzhRcx7jklrhLRJEwL3iWzfrsFxFOv+Ke0YCSSIFhJc4k5j01E6QFo8NxtUUnurP70uJplsBpBHd85mR8p0GbgKvZOxYAc3tMrg2S5ozOh3+mRHwUY4uDlxP4fUaU7po2sI4U2Ew1zmCRclzHTv/umfqsd/4r+1IcMl3hoy3khpJgwZi8RI2lXe3sqAEEWGU3ABb0vpvotajXpuM02MaMhAaXENJDZg3tqYj/heNw33sfaW2xRwNnahzXNYajmyXvjKDma4ZBaLNi1hOiG4gKtM9mwhzWNAG5E5nEZRqPTr1UauKLc5a4NtHV0X3bfVV4XiDzTLRIkATHds4EQTvM/2U3FN7vkQ1FbJ0yNfidduRpcymXGBLBmJNxA92bjbcK91Euqn2hzqxcAJJIa2Tc5Y2jQCNFs4XiwdlpuDQGXaXXIIIdlmLCW+KB7dgqVKQfmcQXNblIIBMn8Q6mHAxGgVXpWn3VQ/B77sLa5jclMtYabMnfEM0M03ExE2t16yFPA4jPhXBz34h7H5QO6JaRkyvDmzOZzT3QQIm0EivhOKq03dnmYwOBvUAcP8ut48fBamJfTHZP8A/ea9veaG5ahJkNIAm1/O6sWopU3YjwK7SDMK4UWZKeWo4NjtAMvccSe8Zd3IytBIkdb2zcVxcYcNosBaaoLiXFuRx0IZTjfaSNhpCJq4otqFgY5jawdFNgykiSGN7PY91x63mLK7DcExGIex7qTyXZyHMphhpgmzS+rYQC64gmUiyOUq6CtRirZXg69LsS6qPfpgPY5pmW5mtIiCBqNDq02Xn3Em0wH9nI70DeWg2BI8I+C9gofw/rVe5iajWUASWspOcalzeXOECd9ftynPP8Pa9G2DpvrUfegZS9lu9NwXGRaATfwWzBCUZpy23MWo1EJRaTvY88pP2R1KwlAZS1xa4Frhq1wLXDzabhXdquyjjsINzKZxBQ4qKbXBSwCi0QqQ5Vdom7RLZIQKqZDZ0kAbmIbTrN74B+qDpcIe1pLBmYNfBVGqZt8lr8F4m+nbLIOo6hYVxLkbrje5yeJbDihhqui47gAamam0gG8HYrNHC3+Cvim0UuUU+YE1ez4KpgBwumzKztDTZbLD+0tmcXecryqnwtw1IXQ43iDX02sbTazLF5JmE3DK+RZDPjjFq9zN4hW/Efl90GAose/LmbfqNwpUyWuzNdBGhGq2mcztY0doySIu3r1jZZtZLPjinijf1/gTTrFklU3RyXF8R2jCx4cLyDGhCxcLhHFri3vBp2XqFDmLDVKjXZcsa90CfM9dlrPxHDngvqU6YcWxZovlnKLbLmz7UyR2ljZtjo4p3FnnnLXJuIxTO1zso05gF4Jc6DqGjbW8r1TgPJ2CpNbnBrOAu6oTB/6AcsecoLhvHuHMaA9zWAWAJzNHhHqimcw4J0Cm9rh1acuniCufqtZqZu1FpfL92aMeGMdr3O5wFRjWhjGta0WDWgAAeAC0qLgvNKPNOFY7K+oxg8al/DUrcwfNFCBDzcWOoM6XFoS4dVkg+/H6leXTX7JucX5WwmIcX1aNNz3AAuMyY0mNT4qrhXA6WGaadINDCdPrc6oXBcfZUkOqNadrj+myqrcRAcS+qMoiCLfHqp1Gtg6ai/v/AARDBlVxbNSrwrDuBD6NNwOoLGkfMIWpyjgHMLfZaMXPdYGuE9HNghVniNMi1QfEfRPQx7ItU26j1SR10Yuq2+YPDPxZHDcj8Pb/APHaZ1lzzNoOrkRiuSsJUZlY11GBA7IwB07hlvyUqePbHvzHXzRDOJgGMwWmGvwvaX8FTx5k7Tfmc47+GLA7NTxDg6Qe8xpEjqAQub5k5C4iTnayg/KTHZPd2jgY/WGgbwAV6R/NpMSPS8KY4jBu4fQfVMtbpLtDcWoSps+eXYmtJpCjWzsMOpsouc+mf80ixJ8Nlv8AD+A4mqab3YLFfhye4HUi+wgvnceEG5C9mr8bptIzZZPrKjU42GibAeX7qyWp0q5SHWXP7tnn/KWFBxQIZV7UNlz6oIfTaXZsrwd5JAsCco209SbiIb3lm/zZpuS0yBcC8fVDPx9OqSBU01iLfFUPWY8bcsTtvoJkjPLXEqo3cNVzX2RBcFz+FxTaYHfsesSqqvGhPvCNrj+yrIdqQhjXH7RS9LKUu7yDeYuXcLjKZZiKbXEizwAKjDsWvFx9DvK8B4lyHj6VSoxuHfUYxzg2ozKQ9oPdcGzNxtC92pYpjvzHyn6rjecufxQfUw+GE1G93OfdY4gH/qIn4hatP2jkyusUU/r59KRXPAo+06PFyCCQZBBIINiCNQRsU+Yoqrh3vc57nS5xLiTuSZJ+JSGBf4Lu/MybA+ZSZTJ0RIwp3BUmNg7jxIQAP7K5JdHQ4fRc0E4lgJ2III+SSCLAxX8E4xZCHkHQg+RBUXnqqR9gipiSd0JVe7aU3bDa6QqnohToHFMrNfzUTUTYlp1kIfM3d/wVydlbVBJeq6xkQVFtSluXFWnEUYPccTBgkqXuiFzAaBftCINV43BPTRZWHxZCudWJ0XNljdnYhK1sGue4+8B8VWaPgB85UDmMWOyeHaJUq5D7k2NboWgjw+y08NxPIMrSQ3yMDr81mMpuzADUozDUyCS7RrgCOoP/ACq8ii1vuWwckbPC+Iw7Me9HwPgugONbVEmxA6i3ksnC4mk1oHZMIA3/ADaWJRTK2HcJbRmAe6ajiD6H+5XIzRUpXwvy/s3xutw/DUHFs06b3jrYAjwJ19EW3HtaMrmvpPGkg+tim4ZzIwU2tYwtAFpMq/EcdcWd4NcLWIBIWOUZN1KPmOPgcc0mDUM+UBE1sS39c+Uk/IKnCYrDvILqYHk4C99vgjqePaGxSAAnQAfRZ5xSd0wfyMiriXa03E+sIahzG5joeC6DofutLiXEmg/iUxrfugfBwUqlOi9gLKQkiQ4MzR67qxcNd6NpkSVlNbmljzIpuzf6QTO0ELPxHFaxuaRjoZy+t0dR4h2IOZrXMmJaGgt822KtxPFKToJE9Bt5eSlKMX3YWvmLwrkZWH4jiiO4Hx/kED4j7qNAYp5LgXydiHSPVdRw/HNyyRH1HRaVDE0NWZWnciM3UwpjlW/dSK5Lh6HL4PhVcjMapnW4dEDxJB+Ss4tg6+Vvd797u/w2tAnNa58l1X80pRJc1xG0yfOy5rjvHCyhUqPIJykN8XGYVsEpSj1be2xVKckm+VHmx5lxILhTxFQMcdjFtBG7fRAUzuf3KFZRdsQiGMf0C9ljxQx+xGvkjz8pym7k7CA9TFQoXO4fkKcYrq1w9E9iBraxTCsVQ3GsUvagi0BaajuiZUHGn9KSAOfr8HxFM96k8eQJ+YVLcTVZbM4eB+xXp1GBbwlW1aLHCHtDr7iZm3j0Wf03ijS9P4M8wbxSqPzT5gK1vGH7hvzXU8Z5Spvl9A5Hfp1addOm2k+S4vEYR7CQ4ER8PirFKMiqUJRNFvGerPgfuk7HMdsR6LHUg5NSXISzWa4HRw+acsdtdZjK0IuhiwFNsgrq4d4MhpVlFzt2laeFxQO6PpvB6JJJPmWwyyhyKsHxNoABb4aeqMOLpHMRAJvMJhRB2CQw46BZXpIN2ma12hNLkiAx9PM2bbEx4qipiwDUGocT8jYj4BEHDD9ITHDj9IQtJFdQfaEn+koZXV9DHFpt8d03s46Jjhh0Q9JF9SV2hJdPMKZiG3g2M7wBOyI9uGUGb6G+p1WZ2A6Juy/u6rehT6li7Tfu+ZojiDfsf3VlXjTm5MrjE6bGOqyxTPj81LKfH4qPV8erD1nL3TtcNzJRLPx3McLQ0NzO8iClh+aMPTgUhVsTbRsEyYF1xjWn9R+JUwXfrd/uP3Wf1Pj8WT60l7p2p4hSrhwa6CRMPEabT5K9uIptZOYNMA9fAW+HzXBEO/U7/cVAsPU/EpfU8eXE6G9av3fM6qtxstd3e8Oo6eFoUKmNpuEw4uMzmJaBPlruuXFM+KdtBXLsrGuTYj7Tm/0o1Rj3BxyMcG5jJDSTGwA1O/hohuLYiviXCaZYxvutkT5u6lDtw3grGYcdAtWLSYsclJLdGTLq8mRcL5FTOGv6D1cwfUq4cOP6qY86lP8A/StbRHQKxtMLXxGaij+X9a1Ier3f+LSpewt3rA/6abz/AOWVXZR1T2UcTCgU8MonU1D5MY3553fRPS4ZQGlOof8AVVt8G0x9UT2jRum9qYN0Wwoj7LT/APpp/wC6v/SqkmPE6f6h8UlNsKB8TxBo363hCO5mY0b/ADTpLPCKk9zVObitiVLm1ovlIHWE1fGYfE6S136gNdrghJJTOCStCwyNumc/xbhRputBB0I39NllJJJ8Um1uJmik9hJJJK0pJNnZXsxVRu5SSUDVtYdQ408aifJEt475pJIoCY40Fczi7TqkkloC5vE2+Kl7e1JJRZND+3BL2wJJIsCQxgS9rCSSLChjjAmOOCSSLChvbmpvb2pkkAI8RCQ4mAkkgBfzYeKZ3F0kkwFTuNKl3GikkoAgeLPVb+Iv6p0lJDKvbHH8xUu09Ukk6QrEHpJJIA//2Q==" alt="" />
                                <div className="flex justify-between gap-2 border-b pb-3 border-gray-700">
                                    <div>
                                        <h1 className="text-xl font-semibold px-2">Burger</h1>
                                        <p className="text-md font-normal px-2">10 $</p>
                                    </div>
                                    <div className="flex justify-center items-center border border-gray-700 rounded-xl px-2">
                                        <div>
                                            <button className="text-sm font-light p-1" onClick={()=>{setBurgerCount(1)}}>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-4">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div>
                                            <button className="text-sm font-light p-1">{burgerCount}</button>
                                        </div>
                                        <div>
                                            <button className="text-sm font-light p-1" onClick={()=>setBurgerCount(burgerCount+1)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-4">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className=" shadow-xl p-3 w-full mt-8 bg-[#00000098] text-center hover:bg-gray-700 rounded-lg">
                                <button
                                    onClick={() => {
                                            const newProduct = {
                                            name: "Burger",
                                            unitPrice:10,
                                            price: 10,
                                            quantity: burgerCount,
                                            };

                                            let updatedProducts: typeof products;

                                            const existingIndex = products.findIndex(
                                            (product) => product.name === newProduct.name
                                            );

                                                if (existingIndex !== -1) {
                                                    console.log(existingIndex);
                                                    updatedProducts = [...products];
                                                    updatedProducts[existingIndex].quantity += newProduct.quantity;
                                                    updatedProducts[existingIndex].price += newProduct.price;
                                                } else {
                                                    updatedProducts = [...products,
                                                 {
                                                    ...newProduct,
                                                    price:newProduct.unitPrice * newProduct.quantity
                                                 }
                                                ];
                                            }
                                            setProducts(updatedProducts);
                                            console.log("🛒 Updated Cart:", updatedProducts);
                                        }}
                                        >
                                        Add to cart
                                    </button>
                                </div>
                            </div>
                            <div className="border border-gray-700 rounded-lg p-5">
                                <img className="mb-7 rounded-lg object-fill" src="data:image/jpeg;base64,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" alt="" />
                                <div className="flex justify-between gap-2 border-b pb-3 border-gray-700">
                                    <div>
                                        <h1 className="text-xl font-semibold px-2">Coke</h1>
                                        <p className="text-md font-normal px-2">5 $</p>
                                    </div>
                                    <div className="flex justify-center items-center border border-gray-700 rounded-xl px-2">
                                        <div>
                                            <button className="text-sm font-light p-1" onClick={()=>{setCokeCount(1)}}>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-4">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div>
                                            <button className="text-sm font-light p-1">{cokeCount}</button>
                                        </div>
                                        <div>
                                            <button className="text-sm font-light p-1" onClick={()=>setCokeCount(cokeCount+1)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-4">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className=" shadow-xl p-3 w-full mt-8 bg-[#00000098] text-center hover:bg-gray-700 rounded-lg">
                                <button
                                    onClick={() => {
                                    const newProduct = {
                                        name: "Coke",
                                        price:5,
                                        unitPrice: 5,
                                        quantity: cokeCount,
                                    };

                                    let updatedProducts;

                                    const existingIndex = products.findIndex(
                                        (product) => product.name === newProduct.name
                                    );

                                    if (existingIndex !== -1) {
                                        updatedProducts = [...products];
                                        updatedProducts[existingIndex].quantity += newProduct.quantity;
                                        updatedProducts[existingIndex].price = updatedProducts[existingIndex].unitPrice * updatedProducts[existingIndex].quantity;
                                    } else {
                                        updatedProducts = [
                                        ...products,
                                        {
                                            ...newProduct,
                                            price: newProduct.unitPrice * newProduct.quantity,
                                        },
                                        ];
                                    }

                                    setProducts(updatedProducts);
                                    console.log("🛒 Cart Updated:", updatedProducts);
                                    }}
                                >
                                    Add to Cart
                                </button>
                                </div>
                            </div>
                            <div className="border border-gray-700 rounded-lg p-5">
                                <img className="mb-7 rounded-lg object-fill" src="data:image/jpeg;base64,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" alt="" />
                                <div className="flex justify-between gap-2 border-b pb-3 border-gray-700">
                                    <div>
                                        <h1 className="text-xl font-semibold px-2">Pizza</h1>
                                        <p className="text-md font-normal px-2">20 $</p>
                                    </div>
                                    <div className="flex justify-center items-center border border-gray-700 rounded-xl px-2">
                                        <div>
                                            <button className="text-sm font-light p-1" onClick={()=>{setPizzaCount(1)}}>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-4">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div>
                                            <button className="text-sm font-light p-1">{pizzaCount}</button>
                                        </div>
                                        <div>
                                            <button className="text-sm font-light p-1" onClick={()=>setPizzaCount(pizzaCount+1)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-4">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="shadow-xl p-3 w-full mt-8 bg-[#00000098] text-center hover:bg-gray-700 rounded-lg">
                                    <button onClick={()=>{
                                        const newProducts = ({
                                            name:"Pizza",
                                            price:30,
                                            unitPrice:30,
                                            quantity:pizzaCount 
                                        });
                                        let updatedProducts;
                                        const existingIndex = products.findIndex(
                                            (product)=>product.name === newProducts.name
                                        );
                                        if (existingIndex !== -1) {
                                            updatedProducts  = [...products];
                                            updatedProducts[existingIndex].quantity += newProducts.quantity
                                            updatedProducts[existingIndex].price = updatedProducts[existingIndex].unitPrice * updatedProducts[existingIndex].quantity
                                        }else {
                                            updatedProducts = [...products,{
                                                ...newProducts,
                                                price:newProducts.unitPrice * newProducts.quantity
                                            }]
                                        }
                                        setProducts(updatedProducts);
                                        console.log(updatedProducts);
                                    }}>Add to cart</button>
                                </div>
                            </div>
                    </div>
                </div>
            </div>
        )}
        {showCartModel && (
            <div className="fixed inset-0 bottom-0 top-0 bg-slate-600 backdrop-blur-sm bg-opacity-10 flex flex-col justify-center items-center">
                <div className="bg-white p-10">
                    <h1 className="text-3xl text-bold text-black">Cart</h1>
                    {products.map((product,index)=>(
                        <div key={index} className="">
                            <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 font-medium text-gray-900">Product Name</th>
                                    <th scope="col" className="px-6 py-4 font-medium text-gray-900">Product Price</th>
                                    <th scope="col" className="px-6 py-4 font-medium text-gray-900">Product Quantity</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 border-t border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-medium text-gray-900">{product.name}</th>
                                    <td className="px-6 py-4">{product.price} $</td>
                                    <td className="px-6 py-4">{product.quantity}</td>
                                    <td className="flex justify-end gap-4 px-6 py-4 font-medium">
                                    <a href="">Delete</a>
                                    <a href="" className="text-primary-700">Edit</a></td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    ))}
                    <div>
                        <div>
                            <button className="shadow-xl p-3 w-full mt-8 bg-[#00000098] text-center hover:bg-gray-700 rounded-lg" onClick={async()=>{
                                    try {
                                        const deliveryRes =  await axios.get(`${BACKEND_URL}/order/delivery-available`)
                                        const restaurentRes = await axios.get(`${BACKEND_URL}/order/restaurent-available`)
                                        if (deliveryRes.data && restaurentRes.data) {
                                            const deliveryList = deliveryRes.data.details; // ✅ Should be an array
                                            const restaurentList = restaurentRes.data.details; // ✅ Should be an array

                                            if (deliveryList.length === 0 || restaurentList.length === 0) {
                                                toast.error("No delivery agents or restaurants available");
                                                return;
                                            }
                                          
                                            const deliveryIds = deliveryList.map((agent:any) => agent.id);
                                            const restaurentIds = restaurentList.map((rest:any) => rest.id);
                                          
                                            const randomAgent = deliveryIds[Math.floor(Math.random() * deliveryIds.length)];
                                            const randomRestaurent = restaurentIds[Math.floor(Math.random() * restaurentIds.length)];
                                            const res = await axios.post(`${BACKEND_URL}/order/place-order`,{
                                                restaurentId:randomRestaurent,
                                                userId:userId,
                                                deliveryId:randomAgent,
                                                totalPrice:totalPrice, 
                                                items:products 
                                            })
                                            if (res.data) {
                                                toast.success("Order Placed Successfully");
                                                setShowCartModel(false);
                                                // router.push("/order-confirmed");
                                            }   
                                        } 
                                    }catch (error) {
                                        console.error(error);
                                        toast.error("Something Went Wrong!!")
                                    }
                                }}>Place Order</button>
                            </div>    
                    </div>                    
                </div>
            </div>
        )}
    </div>
}