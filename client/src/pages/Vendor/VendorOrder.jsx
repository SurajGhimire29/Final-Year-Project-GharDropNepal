import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  ShoppingBag, Package, Loader2, MapPin, 
  Phone, Banknote, CreditCard, RefreshCcw, 
  Info, CheckCircle2, User, Mail, ShieldCheck
} from 'lucide-react';

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 1. DYNAMIC ID DETECTION (Fixed for your specific storage)
  const API_URL = 'http://localhost:3000'; 
  
  // Get ID directly based on your provided structure
  const myVendorId = localStorage.getItem('userId'); 
  const myName = localStorage.getItem('userName');

  const fetchOrders = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const { data } = await axios.get(`${API_URL}/vendor/orders`, { 
        withCredentials: true 
      });
      
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(true), 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'Order Placed' ? 'Processing' : 'Ready for Pickup';
      const { data } = await axios.put(`${API_URL}/order/${orderId}/status`, 
        { status: nextStatus }, 
        { withCredentials: true }
      );
      if (data.success) fetchOrders(true);
    } catch (err) {
      console.error("Status Update Error:", err);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#f0f9f4]">
      <Loader2 className="animate-spin text-[#1b4332]" size={48} />
      <p className="text-[#1b4332] font-black uppercase text-[10px] tracking-[0.3em] mt-4">GharDrop Live Sync</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0f9f4] p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
                <span className="bg-[#1b4332] text-[#ffb703] text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={12}/> Vendor: {myName || 'Authorized'}
                </span>
                {refreshing && <RefreshCcw size={14} className="animate-spin text-[#40916c]" />}
            </div>
            <h1 className="text-6xl font-black text-[#1b4332] uppercase tracking-tighter leading-none">
              Order <span className="text-[#40916c]">Queue</span>
            </h1>
          </div>

          <div className="bg-white px-10 py-5 rounded-[2.5rem] shadow-xl border border-[#d8f3dc] text-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Active Requests</span>
              <span className="text-4xl font-black text-[#1b4332]">{orders.length}</span>
          </div>
        </div>

        {/* Orders Mapping */}
        <div className="grid gap-10">
          {orders.map((order) => {
            
            // --- FILTERING USING YOUR 'userId' KEY ---
            const myShopItems = order.items.filter(item => {
              const itemVendorId = item.vendor?._id || item.vendor;
              return String(itemVendorId) === String(myVendorId);
            });

            if (myShopItems.length === 0) return null;

            const myPayout = myShopItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            const currentItemStatus = myShopItems[0].itemStatus || order.shippingStatus;

            return (
              <div key={order._id} className="bg-white rounded-[4rem] p-10 border border-[#d8f3dc] shadow-xl relative overflow-hidden hover:shadow-2xl transition-all group">
                
                {/* 1. Customer Header */}
                <div className="flex flex-col lg:flex-row justify-between border-b-2 border-dashed border-[#f0f9f4] pb-8 mb-8 gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 bg-[#1b4332] rounded-[2rem] flex items-center justify-center text-[#ffb703] shadow-lg">
                      <User size={36} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-[#1b4332] uppercase italic">
                        {order.user?.fullName || "Incoming Order"}
                      </h3>
                      <div className="flex gap-6 mt-1">
                        <span className="flex items-center gap-2 text-xs font-bold text-[#40916c]"><Phone size={14}/> {order.shippingAddress?.phoneNumber}</span>
                        <span className="flex items-center gap-2 text-xs font-bold text-[#40916c]"><Mail size={14}/> {order.user?.email || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="px-5 py-2 rounded-full border-2 border-orange-100 bg-orange-50 text-orange-600 font-black text-xs uppercase tracking-widest">
                      {currentItemStatus}
                    </div>
                    <p className="text-[10px] font-bold text-gray-300 mt-3 uppercase tracking-tighter">Order #{order._id.slice(-8)}</p>
                  </div>
                </div>

                {/* 2. Items & Logistics */}
                <div className="grid lg:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2"><Package size={16}/> Shop Items</h4>
                    {myShopItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-[#f8fdfa] p-5 rounded-3xl border border-[#eefaf1] hover:border-[#40916c] transition-colors shadow-sm">
                        <span className="font-bold text-[#1b4332] uppercase text-sm">{item.quantity}x {item.name}</span>
                        <span className="font-black text-lg text-[#1b4332]">Rs.{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-6">
                    <div className="bg-[#1b4332] p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
                      <h4 className="text-[10px] font-black uppercase opacity-50 mb-3 flex items-center gap-2"><MapPin size={14}/> Dropoff Point</h4>
                      <p className="text-xl font-bold leading-tight">{order.shippingAddress?.addressLine}</p>
                      <p className="text-xs opacity-70 mt-1 font-black">{order.shippingAddress?.city}, Nepal</p>
                      <MapPin size={100} className="absolute -right-6 -bottom-6 opacity-10 rotate-12" />
                    </div>
                    <div className="flex justify-between items-center px-4">
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase">Payment Method</p>
                          <div className="flex items-center gap-2 font-black text-[#1b4332] text-lg">
                             {order.paymentDetails?.method === 'COD' ? <Banknote size={20}/> : <CreditCard size={20}/>}
                             {order.paymentDetails?.method || 'Online'}
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Earnings</p>
                          <p className="text-4xl font-black text-[#1b4332]">Rs.{myPayout}</p>
                       </div>
                    </div>
                  </div>
                </div>

                {/* 3. Action Bar */}
                <div className="mt-10 pt-8 border-t-2 border-[#f0f9f4] flex justify-end">
                  <button 
                    onClick={() => handleUpdateStatus(order._id, currentItemStatus)}
                    disabled={currentItemStatus === 'Ready for Pickup' || currentItemStatus === 'Delivered'}
                    className="bg-[#40916c] hover:bg-[#1b4332] disabled:bg-gray-100 disabled:text-gray-400 text-white px-12 py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-xl transition-all flex items-center gap-3 active:scale-95"
                  >
                    <CheckCircle2 size={18} /> 
                    {currentItemStatus === 'Order Placed' ? 'Confirm & Process' : 'Ready for Pickup'}
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {orders.length === 0 && (
          <div className="bg-white rounded-[5rem] p-32 text-center border-4 border-dashed border-[#d8f3dc]">
            <ShoppingBag size={64} className="mx-auto text-[#d8f3dc] mb-6" />
            <p className="text-[#1b4332] font-black uppercase italic tracking-widest text-xl">No pending orders found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorOrders;