import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  ArrowLeft, Send, TrendingUp, Calendar, 
  History, Info, Loader2, Store, CheckCircle2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { toast } from "react-hot-toast";

const VendorEarnings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // New state for visual feedback
  const [earningStats, setEarningStats] = useState({
    totalBalance: 0,
    withdrawn: 0,
    pendingSettlement: 0,
    history: []
  });

  const API_URL = "http://localhost:3000"; 

  useEffect(() => {
    fetchVendorLedger();
  }, []);

  const fetchVendorLedger = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/vendor/earnings-stats`, { withCredentials: true });

      if (res.data.success) {
        const { totalEarned, totalWithdrawn, withdrawable, pending, transactions } = res.data.data;

        setEarningStats({
          totalBalance: withdrawable,
          withdrawn: totalWithdrawn,
          pendingSettlement: pending,
          history: transactions
        });
      }
    } catch (error) {
      console.error("Ledger Sync Error:", error);
      toast.error(error.response?.data?.message || "Failed to sync merchant ledger");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawRequest = async () => {
    if (earningStats.totalBalance < 1000) {
      return toast.error(`Insufficient Balance. Need Rs. ${Math.round(1000 - earningStats.totalBalance)} more.`);
    }

    try {
      setRequesting(true);
      const res = await axios.post(`${API_URL}/vendor/request-payout`, {}, { withCredentials: true });

      if (res.data.success) {
        setIsSuccess(true); // LOCK THE BUTTON STATE
        toast.success("Payout Request Created Successfully!");
        
        // Wait 2 seconds so they see the success state, then refresh the dashboard
        setTimeout(async () => {
          await fetchVendorLedger();
          setIsSuccess(false);
          setRequesting(false);
        }, 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Payout request failed.");
      setRequesting(false);
      setIsSuccess(false);
    }
  };

  const chartData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return { dayName: days[d.getDay()], dateString: d.toDateString(), amount: 0 };
    }).reverse();

    earningStats.history.forEach(item => {
      if (item.type === "Income" && item.status === "Delivered") {
        const itemDate = new Date(item.date).toDateString();
        const dayMatch = last7Days.find(d => d.dateString === itemDate);
        if (dayMatch) {
          dayMatch.amount += Math.round(item.amount);
        }
      }
    });

    return last7Days.map(d => ({ day: d.dayName, amount: d.amount }));
  }, [earningStats.history]);

  if (loading && !requesting) return (
    <div className="flex min-h-screen items-center justify-center bg-[#f0f9f4]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-[#1b4332]" size={50} />
        <p className="text-[#1b4332] font-black text-[10px] uppercase tracking-widest italic">Syncing Ledger...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0f9f4] p-4 md:p-8 text-[#1b4332] font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 w-fit px-4 py-2 rounded-xl bg-white border border-[#d8f3dc] hover:bg-[#d8f3dc] transition-all shadow-sm group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-wider">Dashboard</span>
          </button>

          <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-[#1b4332] uppercase text-center">
            Merchant <span className="text-[#40916c]">Payouts</span>
          </h1>

          {/* DYNAMIC BUTTON STATE */}
          <button
            onClick={handleWithdrawRequest}
            disabled={requesting || isSuccess || earningStats.totalBalance < 1000}
            className={`flex items-center justify-center gap-2 px-8 py-3 rounded-2xl font-black text-xs uppercase shadow-lg transition-all transform active:scale-95 ${
                isSuccess 
                ? "bg-green-600 text-white scale-105" 
                : "bg-[#1b4332] text-white hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed"
            }`}
          >
            {requesting && !isSuccess ? (
              <Loader2 className="animate-spin" size={16} />
            ) : isSuccess ? (
              <CheckCircle2 size={16} />
            ) : (
              <Send size={16} />
            )}
            
            {requesting && !isSuccess ? "Processing..." : isSuccess ? "Request Sent!" : "Request Payout"}
          </button>
        </header>

        {/* BALANCE SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 shadow-xl border-4 border-[#d8f3dc] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-[#40916c]">
                <Store size={120} />
            </div>
            <p className="text-[#40916c] text-[10px] uppercase font-black tracking-[0.2em] mb-2">Available Share (90%)</p>
            <h2 className="text-6xl font-black mb-6 tracking-tighter">Rs. {Math.round(earningStats.totalBalance).toLocaleString()}</h2>

            <div className="flex items-center gap-2 text-[#1b4332] bg-[#d8f3dc]/40 px-4 py-2 rounded-full w-fit">
              <Info size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Min. Threshold: Rs. 1,000
              </span>
            </div>
          </div>

          <div className="bg-[#1b4332] rounded-[2.5rem] p-8 text-white border border-[#2d6a4f] shadow-md flex flex-col justify-between">
            <div className="space-y-8">
              <div>
                <p className="text-[10px] text-[#95d5b2] font-black uppercase tracking-[0.2em] mb-1">Total Disbursed</p>
                <p className="text-2xl font-black text-[#d8f3dc]">Rs. {earningStats.withdrawn.toLocaleString()}</p>
                <p className="text-[9px] text-[#40916c] font-bold uppercase mt-1">Verified Payouts</p>
              </div>

              <div className="border-t border-white/10" />

              <div>
                <p className="text-[10px] text-[#95d5b2] font-black uppercase tracking-[0.2em] mb-1">Pending Clearance</p>
                <p className="text-2xl font-black text-[#ffb703]">Rs. {Math.round(earningStats.pendingSettlement).toLocaleString()}</p>
                <p className="text-[9px] text-[#ffb703]/60 font-bold uppercase mt-1">Items in Delivery</p>
              </div>
            </div>
          </div>
        </div>

        {/* ANALYTICS & HISTORY */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] border-4 border-[#d8f3dc] shadow-sm">
            <h3 className="flex items-center gap-2 text-xs font-black mb-8 text-[#1b4332] uppercase tracking-widest">
              <TrendingUp size={18} /> Daily Revenue
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid stroke="#f0f9f4" vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="day" stroke="#1b4332" axisLine={false} tickLine={false} fontSize={12} fontWeight="black" />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{backgroundColor: '#1b4332', borderRadius: '15px', border: 'none', color: '#fff', fontSize: '11px'}}
                  />
                  <Bar dataKey="amount" radius={[10, 10, 10, 10]} barSize={35}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.amount > 0 ? "#40916c" : "#d8f3dc"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border-4 border-[#d8f3dc] shadow-sm overflow-hidden flex flex-col">
            <h3 className="flex items-center gap-2 text-xs font-black mb-8 text-[#1b4332] uppercase tracking-widest">
              <History size={18} /> Transaction History
            </h3>
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {earningStats.history.length > 0 ? (
                earningStats.history.map((item) => (
                  <div key={item._id} className="flex justify-between items-center p-5 bg-[#f0f9f4] rounded-2xl border-2 border-transparent hover:border-[#40916c] transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        item.type === 'Income' ? 'bg-green-100 text-green-600' : 
                        item.type === 'Banner Fee' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        <History size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-wider text-[#1b4332]">{item.reference}</p>
                        <p className="text-[10px] font-bold text-[#40916c]">{new Date(item.date).toDateString()} • {item.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-black text-lg ${item.type === 'Income' ? 'text-[#1b4332]' : 'text-red-500'}`}>
                        {item.type === 'Income' ? '+' : '-'} Rs. {Math.round(item.amount).toLocaleString()}
                      </p>
                      <span className={`text-[9px] font-black uppercase ${item.status === 'Delivered' || item.status === 'Completed' ? 'text-green-600' : 'text-orange-500'}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 opacity-20 italic font-bold uppercase text-[10px] tracking-widest">No orders recorded</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorEarnings;