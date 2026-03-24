import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Users,
  Store,
  Package,
  Truck,
  TrendingUp,
  Settings,
  LogOut,
  Loader2,
  LayoutDashboard,
  ShieldCheck,
  ArrowUpRight,
  ClipboardList,
  ShieldAlert
} from "lucide-react";

const AdminHome = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalProducts: 0,
    totalDelivery: 0,
  });

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      try {
        const res = await axios.get("http://localhost:3000/me", {
          withCredentials: true,
        });

        if (res.data.user.role !== "admin") {
          return navigate("/signin");
        } 
        
        setAdminName(res.data.user.fullName);
        setLoading(false);

        try {
          const statsRes = await axios.get("http://localhost:3000/admin/stats", {
            withCredentials: true,
          });
          if (statsRes.data.success) {
            setStats(statsRes.data.stats);
          }
        } catch (statError) {
          console.error("Stats Fetch Error:", statError.message);
        }

      } catch (error) {
        console.error("Admin Authentication Error:", error);
        navigate("/signin");
      }
    };

    fetchAdminDashboard();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3000/signout", {
        withCredentials: true,
      });
      localStorage.clear();
      navigate("/signin");
    } catch (error) {
      console.log("Logout error:", error);
    }
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
      <aside className="w-64 bg-[#1b4332] text-white p-6 hidden md:flex flex-col rounded-r-[2rem] shadow-2xl">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="bg-[#ffb703] p-2 rounded-xl text-[#1b4332]">
            <ShieldCheck size={24} strokeWidth={3} />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter">
            Admin Panel
          </h1>
        </div>

        <nav className="flex-grow space-y-2">
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold bg-[#ffb703] text-[#1b4332]"
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>

          {/* Verification Hub: Professional replacement for "Requests" */}
          <button
            onClick={() => navigate("/admin/verifications")}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold hover:bg-[#2d6a4f] transition-all group"
          >
            <div className="flex items-center gap-3">
              <ShieldAlert size={20} className="text-[#ffb703]" />
              Verification Hub
            </div>
            <span className="bg-[#ffb703] text-[#1b4332] text-[10px] px-2 py-0.5 rounded-full font-black">
              PENDING
            </span>
          </button>

          <button
            onClick={() => navigate("/admin/users")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold hover:bg-[#2d6a4f] transition-all"
          >
            <Users size={20} />
            Manage Users
          </button>

          {/* Vendor Details Link */}
          <button
            onClick={() => navigate("/admin/vendor-details")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold hover:bg-[#2d6a4f] transition-all"
          >
            <Store size={20} />
            Manage Vendor
          </button>

          <button
            onClick={() => navigate("/admin/products")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold hover:bg-[#2d6a4f] transition-all"
          >
            <Package size={20} />
            Global Inventory
          </button>

          <button
            onClick={() => navigate("/admin/delivery")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold hover:bg-[#2d6a4f] transition-all"
          >
            <Truck size={20} />
            Manage Delivery
          </button>
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-[#b7e4c7] font-bold hover:text-white mt-auto transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-[#1b4332] uppercase">
              Admin: {adminName || "System Manager"}
            </h2>
            <p className="text-[#40916c] font-medium">
              GharDrop Nepal: Global system overview and performance.
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/reports")}
            className="bg-[#1b4332] text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-[#2d6a4f] transition-all hover:scale-105 shadow-lg"
          >
            <TrendingUp size={20} strokeWidth={3} />
            GENERATE REPORT
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statCards.map((stat, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-[2rem] shadow-sm border border-[#d8f3dc] flex items-center gap-5 hover:border-[#40916c] transition-colors"
            >
              <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs font-black text-[#40916c] uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-2xl font-black text-[#1b4332]">
                  {stat.value || 0}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Performance & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#d8f3dc]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-[#1b4332] uppercase tracking-tight">
                Market Activity
              </h3>
              <TrendingUp className="text-[#40916c]" />
            </div>
            
            <div className="border-2 border-dashed border-[#b7e4c7] rounded-3xl h-64 flex flex-col items-center justify-center text-[#40916c]">
              <TrendingUp size={48} className="opacity-20 mb-2" />
              <p className="font-bold">Real-time Analytics</p>
              <p className="text-sm text-gray-400">Charts will load once enough system data is collected.</p>
            </div>
          </div>

          <div className="bg-[#1b4332] p-8 rounded-[2.5rem] shadow-2xl text-white">
            <h3 className="text-xl font-black uppercase mb-6 tracking-tight">Quick Controls</h3>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-white/10 rounded-2xl hover:bg-[#ffb703] hover:text-[#1b4332] transition-all font-bold text-sm group">
                System Logs <ArrowUpRight size={16} className="opacity-50 group-hover:opacity-100" />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-white/10 rounded-2xl hover:bg-[#ffb703] hover:text-[#1b4332] transition-all font-bold text-sm group">
                Manage Banners <ArrowUpRight size={16} className="opacity-50 group-hover:opacity-100" />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-white/10 rounded-2xl hover:bg-[#ffb703] hover:text-[#1b4332] transition-all font-bold text-sm group">
                Global Settings <Settings size={16} className="opacity-50 group-hover:opacity-100" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminHome;