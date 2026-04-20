import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  MapPin, Loader2, Package, 
  ChevronDown, ChevronUp, Phone, 
  Bike, RefreshCcw, Truck, ArrowLeft // Added ArrowLeft icon
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const ConfirmOrder = () => {
  const navigate = useNavigate(); // Initialize navigate
  const [orders, setOrders] = useState([]);
  const [onlineRiders, setOnlineRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const API_URL = 'http://localhost:3000';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [orderRes, boyRes] = await Promise.all([
        axios.get(`${API_URL}/admin/orders/pending-dispatch`, { withCredentials: true }),
        axios.get(`${API_URL}/admin/delivery-boys/active`, { withCredentials: true })
      ]);

      setOrders(orderRes.data.orders || []);
      setOnlineRiders(boyRes.data.deliveryBoys || []);
      
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Failed to sync dispatch data");
    } finally {
      setLoading(false);
    }
  };

  const handleDispatch = async (orderId) => {
    const selectElement = document.getElementById(`select-${orderId}`);
    const boyId = selectElement.value;
    
    if (!boyId) return toast.error("Please select a rider first!");

    try {
      setBtnLoading(orderId);
      const { data } = await axios.put(`${API_URL}/admin/order-dispatch`, 
        { orderId, deliveryBoyId: boyId }, 
        { withCredentials: true }
      );
      
      if (data.success) {
        setOrders(prevOrders => prevOrders.filter(o => o._id !== orderId));
        toast.success("Order Dispatched Successfully!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Dispatch failed");
    } finally {
      setBtnLoading(null);
    }
  };

  const checkPaymentStatus = (order) => {
    const method = (
      order.paymentInfo?.method || 
      order.paymentDetails?.method || 
      order.paymentMethod || 
      ""
    ).toLowerCase();

    const isKhalti = method.includes('khalti');
    return { isKhalti };
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#f0f9f4]">
      <div className="text-center">
        <Loader2 className="animate-spin text-[#1b4332] mx-auto mb-4" size={48} />
        <p className="font-black text-[#1b4332] uppercase tracking-widest text-xs">Syncing GharDrop Fleet...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0f9f4] p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/admin-dashboard')} // Change this path to your actual dashboard route
          className="group flex items-center gap-2 mb-6 text-[#1b4332] font-black uppercase text-xs tracking-widest hover:gap-4 transition-all"
        >
          <ArrowLeft size={18} strokeWidth={3} />
          <span>Back to Dashboard</span>
        </button>

        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-[#1b4332] uppercase tracking-tighter">
              Dispatch <span className="text-[#40916c]">Control</span>
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="bg-[#1b4332] text-[#ffb703] text-[10px] font-black px-2 py-0.5 rounded shadow-sm">ADMIN</span>
              <p className="text-xs font-bold text-[#40916c] uppercase tracking-widest">Orders: {orders.length}</p>
              <button onClick={fetchData} className="p-1 hover:rotate-180 transition-all duration-300 text-[#1b4332]">
                <RefreshCcw size={14} />
              </button>
            </div>
          </div>

          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-[#d8f3dc] flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Fleet Status</p>
              <p className={`font-black uppercase text-sm ${onlineRiders.length > 0 ? 'text-[#1b4332]' : 'text-red-500'}`}>
                {onlineRiders.length} Available
              </p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${onlineRiders.length > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
               <Bike size={20} className={onlineRiders.length > 0 ? 'animate-bounce' : ''} />
            </div>
          </div>
        </header>

        {/* Order List */}
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="bg-white rounded-[3rem] p-20 text-center border-4 border-dashed border-[#d8f3dc]">
              <Package size={40} className="text-[#40916c] mx-auto mb-4" />
              <h2 className="text-2xl font-black text-[#1b4332] uppercase">All Clear!</h2>
              <p className="font-bold text-[#40916c] mt-2">No orders waiting for dispatch.</p>
            </div>
          ) : (
            orders.map((order) => {
              const { isKhalti } = checkPaymentStatus(order);
              
              return (
                <div key={order._id} className="bg-white rounded-[2.5rem] shadow-xl border border-[#d8f3dc] overflow-hidden hover:shadow-2xl transition-all">
                  
                  <div className="p-6 flex flex-col lg:flex-row justify-between gap-8">
                    <div className="flex-1 flex gap-5">
                      <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 shadow-lg ${isKhalti ? 'bg-[#5C2D91] text-white' : 'bg-[#1b4332] text-[#ffb703]'}`}>
                        <Truck size={32} strokeWidth={2.5} />
                      </div>

                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${isKhalti ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                            {isKhalti ? 'Khalti Paid' : 'Cash on Delivery'}
                          </span>
                          <p className="text-xs font-bold text-gray-300">#{order._id.slice(-6)}</p>
                        </div>
                        <h3 className="text-2xl font-black text-[#1b4332] uppercase leading-none mb-2">
                          {order.user?.fullName || "Valued Customer"}
                        </h3>
                        <div className="flex items-start gap-1 text-[#40916c]">
                          <MapPin size={16} className="mt-0.5 shrink-0" />
                          <p className="text-sm font-bold leading-tight">
                            {order.shippingAddress?.addressLine}, {order.shippingAddress?.city}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="lg:w-80 flex flex-col gap-3 justify-center">
                      <div className="relative">
                        <select 
                          id={`select-${order._id}`} 
                          className="w-full bg-[#f8fdfa] p-4 rounded-2xl border-2 border-[#d8f3dc] font-black text-[#1b4332] outline-none appearance-none"
                        >
                          <option value="">-- SELECT RIDER --</option>
                          {onlineRiders.map(rider => (
                            <option key={rider._id} value={rider._id}>
                              🛵 {rider.fullName}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#40916c] pointer-events-none" size={20} />
                      </div>
                      
                      <button 
                        onClick={() => handleDispatch(order._id)}
                        disabled={onlineRiders.length === 0 || btnLoading === order._id}
                        className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg transition-all ${isKhalti ? 'bg-[#5C2D91] text-white' : 'bg-[#1b4332] text-[#ffb703]'}`}
                      >
                        {btnLoading === order._id ? 'DISPATCHING...' : 'Confirm Dispatch'}
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-[#f0f9f4]">
                    <button 
                      onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                      className="w-full py-4 flex items-center justify-center gap-3 text-[#40916c] font-black text-xs uppercase"
                    >
                      {expandedOrder === order._id ? 'Hide Details' : 'View Items'}
                      {expandedOrder === order._id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                    </button>

                    {expandedOrder === order._id && (
                      <div className="p-8 bg-white border-t border-[#f0f9f4] grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="font-black text-[#1b4332] uppercase text-sm mb-4">Items Ordered</h4>
                          <div className="space-y-3">
                            {(order.items || order.orderItems)?.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center p-3 bg-[#f8fdfa] rounded-xl border border-[#d8f3dc]">
                                <div className="flex items-center gap-3">
                                  <img src={item.image} className="w-10 h-10 rounded-lg object-cover" alt="" />
                                  <p className="text-sm font-black text-[#1b4332]">{item.name} x {item.quantity}</p>
                                </div>
                                <span className="text-sm font-bold">Rs. {item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className={`${isKhalti ? 'bg-[#5C2D91]' : 'bg-[#1b4332]'} p-6 rounded-3xl text-white shadow-lg`}>
                            <p className="text-xs uppercase font-black opacity-80 mb-1">Total Bill</p>
                            <h2 className="text-3xl font-black text-[#ffb703]">Rs. {order.totalAmount || order.totalPrice}</h2>
                            <p className="text-[10px] mt-2 font-bold uppercase tracking-widest">
                              {isKhalti ? 'Payment: Khalti (Verified)' : 'Payment: Cash on Delivery'}
                            </p>
                          </div>
                          
                          <div className="p-4 border-2 border-[#d8f3dc] rounded-2xl flex items-center gap-4 bg-[#f8fdfa]">
                            <Phone size={20} className="text-[#1b4332]" />
                            <p className="font-black text-[#1b4332]">
                              {order.shippingAddress?.phoneNumber || order.shippingAddress?.phoneNo || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmOrder;