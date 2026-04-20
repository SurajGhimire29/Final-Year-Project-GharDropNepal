import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  ArrowLeft, Send, TrendingUp, Calendar, 
  History, ChevronRight, Info, Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { toast } from "react-hot-toast";

const DeliveryEarnings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [earningStats, setEarningStats] = useState({
    totalBalance: 0,
    withdrawn: 0,
    pendingSettlement: 0,
    history: []
  });

  const API_URL = "http://localhost:3000";

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/delivery/my-orders`, { withCredentials: true });

      if (res.data.success) {
        const orders = res.data.orders || [];
        const stats = res.data.stats || { totalEarnings: 0, totalWithdrawn: 0 };

        // The logic remains: Earnings minus the updated 'totalWithdrawn' from User profile
        const available = stats.totalEarnings - (stats.totalWithdrawn || 0);

        setEarningStats({
          totalBalance: available,
          withdrawn: stats.totalWithdrawn || 0,
          pendingSettlement: orders
            .filter(o => o.shippingStatus !== 'Delivered')
            .reduce((sum, o) => sum + (o.deliveryCharge * 0.95), 0),
          history: orders
        });
      }
    } catch (error) {
      console.error("Ledger Sync Error:", error);
      toast.error("Failed to sync financial ledger");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawRequest = async () => {
    if (earningStats.totalBalance < 500) {
      return toast.error("Minimum Rs. 500 required to withdraw");
    }

    try {
      setRequesting(true);
      // Ensure this endpoint matches your backend route
      const res = await axios.post(`${API_URL}/request-payout`, {}, { withCredentials: true });

      if (res.data.success) {
        toast.success("Withdrawal request sent to Admin!");
        fetchEarnings(); // Refresh to show updated pending state if applicable
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Request failed.");
    } finally {
      setRequesting(false);
    }
  };

  const chartData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return {
        dayName: days[d.getDay()],
        dateString: d.toDateString(),
        amount: 0
      };
    }).reverse();

    earningStats.history.forEach(order => {
      if (order.shippingStatus === "Delivered") {
        const orderDate = new Date(order.updatedAt || order.createdAt).toDateString();
        const dayMatch = last7Days.find(d => d.dateString === orderDate);
        if (dayMatch) {
          dayMatch.amount += Math.round(order.deliveryCharge * 0.95);
        }
      }
    });

    return last7Days.map(d => ({ day: d.dayName, amount: d.amount }));
  }, [earningStats.history]);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#081c15] to-[#1b4332]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-[#b7e4c7]" size={50} />
        <p className="text-[#b7e4c7] font-black text-[10px] uppercase tracking-[0.3em]">Syncing Ledger...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#081c15] to-[#1b4332] p-4 md:p-8 text-white font-sans">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <header className="flex items-center justify-between mb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1b4332] border border-[#2d6a4f] hover:bg-[#2d6a4f] transition-all shadow-md group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-wider">Dashboard</span>
          </button>

          <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-[#d8f3dc] uppercase">
            Financial <span className="text-[#52b788]">Ledger</span>
          </h1>

          <button
            onClick={handleWithdrawRequest}
            disabled={requesting || earningStats.totalBalance < 500}
            className="flex items-center gap-2 bg-[#52b788] disabled:bg-gray-600 disabled:cursor-not-allowed text-black px-6 py-2.5 rounded-xl font-black text-xs uppercase shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            {requesting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            {requesting ? "Verifying..." : "Request Payout"}
          </button>
        </header>

        {/* BALANCE SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2 bg-[#1b4332] rounded-[2.5rem] p-10 shadow-2xl border border-[#2d6a4f] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <TrendingUp size={120} />
            </div>
            <p className="text-[#95d5b2] text-[10px] uppercase font-black tracking-[0.2em] mb-2">Available for Withdrawal</p>
            <h2 className="text-6xl font-black mb-6 tracking-tighter">Rs. {Math.max(0, Math.round(earningStats.totalBalance)).toLocaleString()}</h2>

            <div className="flex items-center gap-2 text-[#ffd60a] bg-black/30 px-4 py-2 rounded-full w-fit border border-yellow-500/20">
              <Info size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Threshold: Rs. 500
              </span>
            </div>
          </div>

          <div className="bg-[#081c15] rounded-[2.5rem] p-8 border border-[#2d6a4f] shadow-md flex flex-col justify-between">
            <div className="space-y-8">
              <div>
                <p className="text-[10px] text-[#95d5b2] font-black uppercase tracking-[0.2em] mb-1">Lifetime Payouts</p>
                <p className="text-2xl font-black text-[#d8f3dc]">Rs. {earningStats.withdrawn.toLocaleString()}</p>
                <p className="text-[9px] text-[#40916c] font-bold uppercase mt-1">Successfully Disbursed</p>
              </div>

              <div className="border-t border-[#1b4332]" />

              <div>
                <p className="text-[10px] text-[#95d5b2] font-black uppercase tracking-[0.2em] mb-1">In-Transit Earnings</p>
                <p className="text-2xl font-black text-yellow-500">Rs. {Math.round(earningStats.pendingSettlement).toLocaleString()}</p>
                <p className="text-[9px] text-yellow-500/50 font-bold uppercase mt-1">Awaiting Delivery Completion</p>
              </div>
            </div>

            <div className="mt-8 text-[10px] font-bold text-yellow-200 bg-yellow-900/30 p-4 rounded-2xl border border-yellow-700/30">
              Note: Payouts are processed by GharDrop Admin manually. Check your Khalti/Esewa after approval.
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

          {/* CHART */}
          <div className="bg-[#081c15] p-8 rounded-[2.5rem] border border-[#2d6a4f]">
            <h3 className="flex items-center gap-2 text-xs font-black mb-8 text-[#b7e4c7] uppercase tracking-widest">
              <TrendingUp size={18} /> Performance Analytics
            </h3>

            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid stroke="#1b4332" vertical={false} strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#95d5b2" 
                    axisLine={false} 
                    tickLine={false} 
                    fontSize={12} 
                    fontWeight="bold"
                  />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{backgroundColor: '#081c15', borderRadius: '15px', border: '2px solid #2d6a4f', fontSize: '12px', fontWeight: 'bold'}}
                  />
                  <Bar dataKey="amount" radius={[10, 10, 10, 10]} barSize={35}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.amount > 0 ? "#52b788" : "#1b4332"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* HISTORY */}
          <div className="bg-[#081c15] p-8 rounded-[2.5rem] border border-[#2d6a4f] flex flex-col">
            <h3 className="flex items-center gap-2 text-xs font-black mb-8 text-[#b7e4c7] uppercase tracking-widest">
              <History size={18} /> Delivery Log
            </h3>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {earningStats.history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-30">
                    <History size={48} className="mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No recent records</p>
                </div>
              ) : (
                earningStats.history.map((item) => (
                  <div key={item._id} className="flex justify-between items-center p-5 bg-[#1b4332]/50 rounded-2xl hover:bg-[#1b4332] border border-transparent hover:border-[#40916c] transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#081c15] p-3 rounded-xl text-[#52b788]">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-wider text-[#d8f3dc]">
                          Order #{item._id.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-[10px] font-bold text-[#95d5b2] opacity-60">
                          {new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-black text-[#d8f3dc]">
                        Rs. {Math.round(item.deliveryCharge * 0.95)}
                      </p>
                      <div className={`flex items-center justify-end gap-1 text-[9px] font-black uppercase tracking-tighter mt-1 ${
                        item.shippingStatus === 'Delivered' ? 'text-[#52b788]' : 'text-yellow-500'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${item.shippingStatus === 'Delivered' ? 'bg-[#52b788]' : 'bg-yellow-500 animate-pulse'}`} />
                        {item.shippingStatus === 'Delivered' ? 'Settled' : 'Pending'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button className="w-full mt-auto pt-6 text-[10px] font-black uppercase tracking-widest text-[#52b788] hover:text-[#d8f3dc] flex justify-center items-center gap-2 transition-colors">
              Full Transaction Report <ChevronRight size={14} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DeliveryEarnings;