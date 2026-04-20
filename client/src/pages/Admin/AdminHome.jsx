import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  Store,
  Package,
  Truck,
  TrendingUp,
  LogOut,
  Loader2,
  LayoutDashboard,
  ShieldCheck,
  ShieldAlert,
  Wallet,
  Landmark,
  Image as ImageIcon,
  CheckSquare,
  Bike,
  Banknote,
  HandCoins, // New icon for Pay Delivery
} from "lucide-react";

const AdminHome = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("");
  const [chartData, setChartData] = useState([]);
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalProducts: 0,
    totalDelivery: 0,
    totalRevenue: 0,
    vendorProductSales: 0,
    vendorPayout: 0,
    deliveryOwed: 0,
    adminProfit: 0,
  });

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      try {
        const res = await axios.get("http://localhost:3000/me", { withCredentials: true });
        if (res.data.user.role !== "admin") return navigate("/signin");
        setAdminName(res.data.user.fullName);

        const [statsRes, trendRes] = await Promise.all([
          axios.get("http://localhost:3000/admin/stats", { withCredentials: true }),
          axios.get("http://localhost:3000/admin/sales-trend", { withCredentials: true }),
        ]);

        if (statsRes.data.success) {
          setStats(statsRes.data.stats);
        }
        if (trendRes.data.success) setChartData(trendRes.data.trend);

      } catch (error) {
        console.error("Dashboard Error:", error);
        navigate("/signin");
      } finally {
        setLoading(false);
      }
    };
    fetchAdminDashboard();
  }, [navigate]);

  useLayoutEffect(() => {
    if (!loading && containerRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        window.dispatchEvent(new Event("resize"));
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [loading]);

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3000/signout", { withCredentials: true });
      localStorage.clear();
      navigate("/signin");
    } catch (error) { console.log(error); }
  };

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: <Users size={24} />, color: "bg-[#40916c]" },
    { label: "Active Vendors", value: stats.totalVendors, icon: <Store size={24} />, color: "bg-[#1b4332]" },
    { label: "Total Products", value: stats.totalProducts, icon: <Package size={24} />, color: "bg-[#ffb703]" },
    { label: "Delivery Fleet", value: stats.totalDelivery, icon: <Truck size={24} />, color: "bg-[#2d6a4f]" },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0f9f4]">
        <Loader2 className="animate-spin text-[#1b4332]" size={48} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f0f9f4]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1b4332] text-white p-6 hidden md:flex flex-col rounded-r-[2rem] shadow-2xl sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="bg-[#ffb703] p-2 rounded-xl text-[#1b4332]">
            <ShieldCheck size={24} strokeWidth={3} />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter text-white">Admin Panel</h1>
        </div>
        
        <nav className="flex-grow space-y-2 overflow-y-auto pr-2 custom-scrollbar">
          <button onClick={() => navigate("/admin-dashboard")} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold bg-[#ffb703] text-[#1b4332] shadow-lg">
            <LayoutDashboard size={20} /> Dashboard
          </button>
          
          <button onClick={() => navigate("/admin/confirm-orders")} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold hover:bg-[#2d6a4f] transition-all">
            <CheckSquare size={20} className="text-[#ffb703]" /> Confirm Orders
          </button>

          {/* FINANCE SECTION */}
          <div className="pt-4 pb-2">
            <p className="text-[10px] font-black uppercase text-[#40916c] px-4 mb-2 tracking-[0.2em]">Treasury Ops</p>
            <button onClick={() => navigate("/admin/pay-vendor")} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold hover:bg-[#2d6a4f] transition-all border border-white/5 bg-white/5 mb-2">
                <Banknote size={20} className="text-[#ffb703]" /> Pay Vendor
            </button>

            <button onClick={() => navigate("/admin/pay-delivery")} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold hover:bg-[#2d6a4f] transition-all border border-white/5 bg-white/5">
                <HandCoins size={20} className="text-[#ffb703]" /> Pay Delivery
            </button>
          </div>

          <div className="pt-2">
            <p className="text-[10px] font-black uppercase text-[#40916c] px-4 mb-2 tracking-[0.2em]">Management</p>
            <button onClick={() => navigate("/admin/verifications")} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold hover:bg-[#2d6a4f] transition-all">
                <ShieldAlert size={20} className="text-[#ffb703]" /> Verification Hub
            </button>
            
            <button onClick={() => navigate("/admin/users")} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold hover:bg-[#2d6a4f] transition-all">
                <Users size={20} /> Manage Users
            </button>
            
            <button onClick={() => navigate("/admin/vendor-details")} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold hover:bg-[#2d6a4f] transition-all">
                <Store size={20} /> Manage Vendor
            </button>
            
            <button onClick={() => navigate("/admin/manage-delivery")} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold hover:bg-[#2d6a4f] transition-all">
                <Truck size={20} /> Manage Delivery
            </button>
          </div>
        </nav>
        
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-[#b7e4c7] font-bold hover:text-white mt-auto transition-colors">
          <LogOut size={20} /> Logout
        </button>
      </aside>

      <main className="flex-grow p-8 overflow-y-auto text-left">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-black text-[#1b4332] uppercase tracking-tight">Admin: {adminName}</h2>
            <p className="text-[#40916c] font-semibold italic uppercase text-[10px] tracking-widest">System Pulse Dashboard</p>
          </div>
          <button onClick={() => navigate("/admin/reports")} className="bg-[#1b4332] text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:scale-105 shadow-lg transition-all">
            <TrendingUp size={20} /> REPORTS
          </button>
        </header>

        {/* Treasury Section */}
        <div className="mb-8 bg-white p-8 rounded-[2.5rem] border border-[#d8f3dc] shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Landmark className="text-[#1b4332]" size={24} />
            <h3 className="text-xl font-black text-[#1b4332] uppercase tracking-tight">System Treasury</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#1b4332] p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
              <p className="text-[10px] font-black uppercase opacity-60 mb-1">Total Revenue</p>
              <p className="text-2xl font-black italic">Rs. {Number(stats.totalRevenue || 0).toLocaleString()}</p>
              <Wallet className="absolute -right-4 -bottom-4 size-20 opacity-10" />
            </div>

            <div className="bg-[#f8fdfa] p-6 rounded-3xl border border-[#d8f3dc]">
              <p className="text-[10px] font-black text-[#40916c] uppercase mb-1">Vendor Payouts (90% Item)</p>
              <p className="text-xl font-black text-[#1b4332]">Rs. {Number(stats.vendorPayout || 0).toLocaleString()}</p>
            </div>

            <div className="bg-[#f8fdfa] p-6 rounded-3xl border border-[#d8f3dc]">
              <p className="text-[10px] font-black text-[#40916c] uppercase mb-1">Rider Owed (95% Fee)</p>
              <p className="text-xl font-black text-[#1b4332]">Rs. {Number(stats.deliveryOwed || 0).toLocaleString()}</p>
            </div>

            <div className="bg-[#ffb703]/10 p-6 rounded-3xl border border-[#ffb703]/20">
              <p className="text-[10px] font-black text-[#1b4332] uppercase mb-1">Total Admin Profit</p>
              <p className="text-xl font-black text-[#1b4332]">Rs. {Number(stats.adminProfit || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-[#d8f3dc] flex items-center gap-5">
              <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg`}>{stat.icon}</div>
              <div>
                <p className="text-xs font-black text-[#40916c] uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-[#1b4332]">{stat.value || 0}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#d8f3dc]">
            <h3 className="text-xl font-black text-[#1b4332] uppercase tracking-tight mb-8">Market Activity (7D)</h3>
            <div ref={containerRef} className="w-full h-[400px] relative mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                   <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#40916c" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#40916c" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{fill: '#2d6a4f', fontSize: 11}} />
                  <YAxis tick={{fill: '#2d6a4f', fontSize: 11}} tickFormatter={(v) => `Rs.${v}`} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#1b4332', color: '#fff' }} />
                  <Area type="monotone" dataKey="sales" stroke="#40916c" fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#1b4332] p-8 rounded-[2.5rem] shadow-2xl text-white flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black uppercase mb-6 tracking-tight">Quick Actions</h3>
              <div className="space-y-4">
                <button onClick={() => navigate("/admin/confirm-orders")} className="w-full flex items-center justify-between p-4 bg-[#ffb703] text-[#1b4332] rounded-2xl font-black text-sm">Confirm Orders <CheckSquare size={16} /></button>
                <button onClick={() => navigate("/admin/manage-banners")} className="w-full flex items-center justify-between p-4 bg-white/10 rounded-2xl font-bold text-sm">Banners <ImageIcon size={16} /></button>
                <button onClick={() => navigate("/admin/manage-delivery")} className="w-full flex items-center justify-between p-4 bg-white/10 rounded-2xl font-bold text-sm">Riders <Bike size={16} /></button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminHome;