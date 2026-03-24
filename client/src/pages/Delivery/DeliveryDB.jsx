import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MapPin,
  Package,
  CheckCircle2,
  Clock,
  LogOut,
  Loader2,
  LayoutDashboard,
  Navigation,
  DollarSign,
  Phone,
  ArrowUpRight
} from "lucide-react";

const DeliveryBoyDB = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [driverName, setDriverName] = useState("");
  const [stats, setStats] = useState({
    pendingDeliveries: 0,
    completedToday: 0,
    totalEarnings: 0,
    rating: 0,
  });

  useEffect(() => {
    const fetchDeliveryData = async () => {
      try {
        const res = await axios.get("http://localhost:3000/me", {
          withCredentials: true,
        });

        if (res.data.user.role !== "deliveryBoy") {
          navigate("/signin");
        } else {
          setDriverName(res.data.user.fullName);
          // Simulate or fetch delivery specific stats
          setStats({
            pendingDeliveries: 3,
            completedToday: 8,
            totalEarnings: 1250,
            rating: 4.8
          });
        }
      } catch (error) {
        console.error("Auth Error:", error);
        navigate("/signin");
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3000/signout", { withCredentials: true });
      localStorage.clear();
      navigate("/signin");
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  const statCards = [
    { label: "Active Tasks", value: stats.pendingDeliveries, icon: <Clock size={24} />, color: "bg-[#ffb703]" },
    { label: "Done Today", value: stats.completedToday, icon: <CheckCircle2 size={24} />, color: "bg-[#40916c]" },
    { label: "Daily Pay", value: `Rs. ${stats.totalEarnings}`, icon: <DollarSign size={24} />, color: "bg-[#1b4332]" },
    { label: "Driver Rating", value: stats.rating, icon: <Navigation size={24} />, color: "bg-[#2d6a4f]" },
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
      {/* Sidebar - Consistent with Admin/Vendor */}
      <aside className="w-64 bg-[#1b4332] text-white p-6 hidden md:flex flex-col rounded-r-[2rem] shadow-2xl">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="bg-[#ffb703] p-2 rounded-xl text-[#1b4332]">
            <Package size={24} strokeWidth={3} />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter">GharDrop Go</h1>
        </div>

        <nav className="flex-grow space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold bg-[#ffb703] text-[#1b4332]">
            <LayoutDashboard size={20} />
            My Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold hover:bg-[#2d6a4f] transition-all">
            <Navigation size={20} />
            Active Routes
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold hover:bg-[#2d6a4f] transition-all">
            <Clock size={20} />
            History
          </button>
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-[#b7e4c7] font-bold hover:text-white mt-auto">
          <LogOut size={20} />
          End Shift
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-[#1b4332] uppercase">Hello, {driverName.split(' ')[0]}!</h2>
            <p className="text-[#40916c] font-medium">Ready for your next drop? Stay safe on the road.</p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-[#d8f3dc]">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-bold text-[#1b4332]">Online</span>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statCards.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-[#d8f3dc] flex items-center gap-5">
              <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs font-black text-[#40916c] uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-[#1b4332]">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Deliveries List */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#d8f3dc]">
            <h3 className="text-xl font-black text-[#1b4332] uppercase mb-6 flex items-center gap-2">
              <MapPin className="text-[#ffb703]" /> Assigned Deliveries
            </h3>
            
            <div className="space-y-4">
              {/* Delivery Item Card */}
              {[1, 2].map((item) => (
                <div key={item} className="p-5 rounded-3xl border-2 border-[#f0f9f4] hover:border-[#b7e4c7] transition-all flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#f0f9f4] p-3 rounded-2xl text-[#1b4332]">
                      <Package size={24} />
                    </div>
                    <div>
                      <p className="font-black text-[#1b4332]">Order #GD-102{item}</p>
                      <p className="text-sm text-[#40916c]">Koteshwor -&gt; New Baneshwor</p>
                    </div>
                  </div>
                  <button className="bg-[#1b4332] text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-[#ffb703] hover:text-[#1b4332] transition-colors">
                    Start Navigation
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions / Contact */}
          <div className="bg-[#1b4332] p-8 rounded-[2.5rem] shadow-2xl text-white">
            <h3 className="text-xl font-black uppercase mb-6">Support</h3>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all font-bold group">
                Call Manager <Phone size={18} className="group-hover:shake" />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-[#ffb703] text-[#1b4332] rounded-2xl hover:scale-105 transition-all font-bold">
                Emergency Alert <ArrowUpRight size={18} />
              </button>
              <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10 text-xs text-[#b7e4c7]">
                <p className="font-bold mb-1 underline">Traffic Update:</p>
                Heavy congestion near Kalanki area. Expect 15 min delay.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DeliveryBoyDB;