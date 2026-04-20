import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MapPin, Package, CheckCircle2, Clock, LogOut, Loader2,
  LayoutDashboard, Navigation, DollarSign, Phone, ArrowUpRight,
  ExternalLink, TrendingUp, User, Award
} from "lucide-react";
import { toast } from "react-hot-toast";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DeliveryBoyDB = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [driverName, setDriverName] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [allOrders, setAllOrders] = useState([]); // Store all orders here
  
  const [stats, setStats] = useState({
    pendingDeliveries: 0,
    completedToday: 0,
    totalEarnings: 0
  });

  const API_URL = "http://localhost:3000";

  useEffect(() => {
    fetchDeliveryData();
  }, [navigate]);

  // Dynamic Graph Logic: Aggregates income from the last 7 days based on the database
  const dynamicWeeklyData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return { 
        dayName: days[d.getDay()], 
        dateString: d.toDateString(), 
        income: 0 
      };
    }).reverse();

    allOrders.forEach(order => {
      if (order.shippingStatus === "Delivered") {
        const orderDate = new Date(order.updatedAt).toDateString();
        const dayMatch = last7Days.find(d => d.dateString === orderDate);
        if (dayMatch) {
          dayMatch.income += Math.round(order.deliveryCharge * 0.95);
        }
      }
    });

    return last7Days.map(d => ({ day: d.dayName, income: d.income }));
  }, [allOrders]);

  // Filter ONLY non-delivered orders for the Active Tasks section
  const activeTasks = useMemo(() => {
    return allOrders.filter(order => order.shippingStatus !== "Delivered");
  }, [allOrders]);

  const fetchDeliveryData = async () => {
    try {
      setLoading(true);
      const profileRes = await axios.get(`${API_URL}/me`, { withCredentials: true });
      if (profileRes.data.user.role !== "deliveryBoy") return navigate("/signin");
      
      setDriverName(profileRes.data.user.fullName);
      setIsOnline(profileRes.data.user.isAvailable || false);

      const orderRes = await axios.get(`${API_URL}/delivery/my-orders`, { withCredentials: true });
      if (orderRes.data.success) {
        setAllOrders(orderRes.data.orders); // Using the all-inclusive array from your updated controller
        setStats(orderRes.data.stats);
      }
    } catch (error) {
      toast.error("Dashboard sync failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleOnlineStatus = async () => {
    try {
      const res = await axios.put(`${API_URL}/delivery/availability`, 
        { isAvailable: !isOnline }, { withCredentials: true });
      if (res.data.success) {
        setIsOnline(res.data.isAvailable);
        toast.success(res.data.isAvailable ? "Duty Started" : "Duty Ended");
      }
    } catch (error) { toast.error("Status error"); }
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#f0f9f4]">
      <Loader2 className="animate-spin text-[#1b4332]" size={48} />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f0f9f4] font-sans">
      {/* SIDEBAR */}
      <aside className="w-20 lg:w-64 bg-[#1b4332] text-white p-6 hidden md:flex flex-col rounded-r-[2.5rem] shadow-2xl">
        <div className="flex items-center gap-2 mb-10 overflow-hidden">
          <div className="bg-[#ffb703] p-2 rounded-xl text-[#1b4332] shrink-0">
            <Package size={24} strokeWidth={3} />
          </div>
          <h1 className="text-xl font-black uppercase hidden lg:block tracking-tighter">GharDrop Go</h1>
        </div>
        <nav className="flex-grow space-y-4">
          <NavItem icon={<LayoutDashboard />} label="Dashboard" active onClick={() => navigate('/delivery-dashboard')} />
          <NavItem icon={<Navigation />} label="Active Route" onClick={() => navigate('/live-location')} />
          <NavItem icon={<TrendingUp />} label="Earnings" onClick={() => navigate('/delivery/earnings')} />
        </nav>
        <button onClick={() => navigate('/signin')} className="flex items-center gap-3 text-[#b7e4c7] font-bold mt-auto hover:text-white transition-colors">
          <LogOut size={20} /> <span className="hidden lg:block">End Shift</span>
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-grow p-4 lg:p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-[#1b4332]">Hi, {driverName.split(' ')[0]}!</h2>
            <p className="text-[#40916c] font-bold text-xs uppercase tracking-[0.2em]">Pokhara Central</p>
          </div>
          <button onClick={toggleOnlineStatus} className={`px-6 py-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${isOnline ? 'bg-white border-[#d8f3dc]' : 'bg-gray-100 border-gray-300'}`}>
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="font-black text-xs uppercase tracking-widest">{isOnline ? "Online" : "Offline"}</span>
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <StatCard icon={<Clock />} label="Assigned" value={stats.pendingDeliveries} color="bg-[#ffb703]" />
          <StatCard icon={<CheckCircle2 />} label="Done Today" value={stats.completedToday} color="bg-[#40916c]" />
          <StatCard icon={<DollarSign />} label="Wallet" value={`Rs. ${stats.totalEarnings}`} color="bg-[#1b4332]" isGold />
        </div>

        {/* Dynamic Graph */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-[#d8f3dc] mb-8 shadow-sm">
          <h3 className="text-sm font-black text-[#1b4332] uppercase mb-6 flex items-center gap-2">
             <TrendingUp size={18} className="text-[#40916c]" /> Real-time Performance
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicWeeklyData}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#40916c" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#40916c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold', fill: '#1b4332'}} />
                <YAxis hide />
                <Tooltip 
                   contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                   itemStyle={{ color: '#1b4332', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="income" stroke="#1b4332" strokeWidth={3} fillOpacity={1} fill="url(#colorInc)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filtered Active Tasks */}
        <div className="bg-white rounded-[2.5rem] p-6 lg:p-8 border border-[#d8f3dc]">
          <h3 className="text-xl font-black text-[#1b4332] uppercase mb-6 flex items-center gap-2">
            <MapPin className="text-[#ffb703]" /> Active Tasks
          </h3>
          <div className="space-y-4">
            {activeTasks.length === 0 ? (
              <p className="text-center py-10 text-[#40916c] font-bold text-sm uppercase tracking-widest">Awaiting new assignments...</p>
            ) : (
              activeTasks.map((order) => (
                <div key={order._id} className="p-5 rounded-[2rem] border-2 border-[#f0f9f4] flex justify-between items-center group hover:border-[#b7e4c7] transition-all bg-white hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#f0f9f4] p-3 rounded-xl text-[#1b4332] group-hover:bg-[#1b4332] group-hover:text-[#ffb703] transition-colors"><Package size={22} /></div>
                    <div>
                      <p className="font-black text-[#1b4332] text-sm uppercase tracking-tighter">Order #{order._id.slice(-6)}</p>
                      <p className="text-xs font-bold text-[#40916c]">{order.shippingAddress?.addressLine || 'Address not set'}</p>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/delivery/order/${order._id}`)} className="p-3 bg-[#1b4332] text-white rounded-xl hover:bg-[#ffb703] hover:text-[#1b4332] transition-all">
                    <ArrowUpRight size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      {/* ... Right Sidebar stays the same ... */}
    </div>
  );
};

// ... Subcomponents (StatCard, NavItem, QuickLink) stay the same ...

// HELPERS
const NavItem = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${active ? 'bg-[#ffb703] text-[#1b4332]' : 'text-[#b7e4c7] hover:bg-[#2d6a4f] hover:text-white'}`}
  >
    {icon} <span className="hidden lg:block">{label}</span>
  </button>
);

const StatCard = ({ icon, label, value, color, isGold }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-[#d8f3dc] flex items-center gap-4 shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all">
    <div className={`${color} p-4 rounded-2xl ${isGold ? 'text-[#ffb703]' : 'text-white'}`}>{icon}</div>
    <div>
      <p className="text-[10px] font-black text-[#40916c] uppercase tracking-[0.1em]">{label}</p>
      <p className="text-2xl font-black text-[#1b4332]">{value}</p>
    </div>
  </div>
);

const QuickLink = ({ icon, label }) => (
  <button className="w-full flex items-center justify-between text-xs font-bold text-[#1b4332] hover:translate-x-1 transition-transform">
    {label} {icon}
  </button>
);

export default DeliveryBoyDB;