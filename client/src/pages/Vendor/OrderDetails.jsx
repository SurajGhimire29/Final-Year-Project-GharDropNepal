import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, MapPin, Phone, Package, Truck, Loader2, AlertCircle } from 'lucide-react';

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const currentUser = JSON.parse(localStorage.getItem('user'));
    const API_URL = 'http://localhost:3000';

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                setLoading(true);
                // Ensure this URL matches your backend route exactly
                const { data } = await axios.get(`${API_URL}/order/${id}`, { withCredentials: true });
                
                if (data.success) {
                    setOrder(data.order);
                } else {
                    setError("Could not find this order.");
                }
            } catch (err) {
                console.error("Frontend Fetch Error:", err);
                setError(err.response?.data?.message || "Error connecting to server");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchOrderDetails();
    }, [id]);

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-[#f0f9f4]"><Loader2 className="animate-spin text-[#1b4332]" size={48} /></div>
    );

    if (error || !order) return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#f0f9f4] gap-4">
            <AlertCircle size={48} className="text-red-500" />
            <p className="text-[#1b4332] font-bold">{error || "Order not found"}</p>
            <button onClick={() => navigate('/vendor/orders')} className="text-blue-600 underline">Back to Dashboard</button>
        </div>
    );

    // Filter items belonging to THIS vendor
    const myItems = order.items.filter(item => 
        item.vendor?.toString() === currentUser?._id?.toString()
    );

    const myTotal = myItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <div className="min-h-screen bg-[#f0f9f4] p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate('/vendor/orders')} className="flex items-center gap-2 text-[#1b4332] font-black mb-8">
                    <ArrowLeft size={16} /> BACK
                </button>

                <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-[#d8f3dc]">
                    <div className="bg-[#1b4332] p-10 text-white flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-black uppercase">Order Details</h1>
                            <p className="text-xs opacity-70">ID: {order._id}</p>
                        </div>
                        <div className="bg-[#ffb703] text-[#1b4332] px-4 py-1 rounded-full text-[10px] font-black uppercase">
                            {order.shippingStatus}
                        </div>
                    </div>

                    <div className="p-10 grid md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <h3 className="font-black text-[#1b4332] flex items-center gap-2 border-b pb-2"><Package size={18}/> YOUR ITEMS</h3>
                            {myItems.map((item, i) => (
                                <div key={i} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                                    <span className="font-bold text-[#1b4332]">{item.quantity}x {item.name}</span>
                                    <span className="font-black">Rs. {item.price * item.quantity}</span>
                                </div>
                            ))}
                            <div className="bg-[#1b4332] text-white p-4 rounded-2xl flex justify-between">
                                <span className="font-bold">Your Earnings</span>
                                <span className="font-black text-xl">Rs. {myTotal}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-black text-[#1b4332] flex items-center gap-2 border-b pb-2"><Truck size={18}/> DELIVERY</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <MapPin size={16} className="text-[#40916c]"/>
                                    <p className="text-sm font-bold">{order.shippingAddress?.addressLine}, {order.shippingAddress?.city}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone size={16} className="text-[#40916c]"/>
                                    <p className="text-sm font-bold">{order.shippingAddress?.phoneNumber}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;