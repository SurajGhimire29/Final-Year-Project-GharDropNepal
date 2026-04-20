import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  HandCoins, Search, CheckCircle, Clock, User, 
  Loader2, ChevronLeft, ArrowUpRight, ShieldCheck, AlertCircle 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const PayDelivery = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/admin/withdrawals?role=rider", { 
        withCredentials: true 
      });
      
      if (res.data.success) {
        setRequests(res.data.withdrawals || []);
      }
    } catch (error) {
      console.error("Rider Payout Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprovePayment = async (id) => {
    const isConfirmed = window.confirm(
      "CONFIRMATION REQUIRED:\n\nVerify that the delivery fee has been manually transferred to this rider."
    );
    
    if (!isConfirmed) return;
    
    setProcessingId(id);
    try {
      const res = await axios.put(`http://localhost:3000/admin/withdrawal/${id}`, 
        { status: "Completed" }, 
        { withCredentials: true }
      );
      if (res.data.success) {
        fetchRequests(); 
      }
    } catch (error) {
      console.error("Update Error:", error);
      alert("System error: Could not update payout status.");
    } finally {
      setProcessingId(null);
    }
  };

  // Safe Filter: Prevents the screen from going blank if req.rider is null
  const filteredRequests = requests.filter(req => {
    if (!searchTerm) return true;
    
    const riderName = req.rider?.fullName?.toLowerCase() || "";
    const riderPhone = req.rider?.phoneNumber || "";
    const term = searchTerm.toLowerCase();

    return riderName.includes(term) || riderPhone.includes(term);
  });

  const totalPending = filteredRequests.reduce((acc, curr) => 
    curr.status === 'Pending' ? acc + (curr.amount || 0) : acc, 0
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f9f4]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-[#1b4332]" size={40} />
          <p className="text-[#1b4332] font-black text-xs uppercase tracking-widest">Loading Ledger...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f9f4] p-4 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div className="text-left">
            <button 
              onClick={() => navigate("/admin-dashboard")}
              className="flex items-center gap-2 text-[#1b4332] font-black text-[10px] uppercase tracking-widest mb-4 hover:gap-3 transition-all"
            >
              <ChevronLeft size={14} /> Back to Pulse
            </button>
            <h1 className="text-4xl font-black text-[#1b4332] uppercase tracking-tighter flex items-center gap-3">
              <HandCoins className="text-[#40916c]" size={36} /> Delivery <span className="text-[#40916c]">Payouts</span>
            </h1>
            <p className="text-[#1b4332]/60 font-bold text-xs mt-1 uppercase tracking-widest">Disburse Rider Earnings & Commissions</p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#40916c]" size={18} />
            <input 
              type="text"
              placeholder="Search Rider Name/Phone..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-[#d8f3dc] focus:border-[#40916c] outline-none font-bold text-sm transition-all shadow-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-[3rem] border-4 border-[#d8f3dc] overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f0f9f4] border-b-2 border-[#d8f3dc]">
                <th className="px-8 py-6 text-[10px] font-black text-[#40916c] uppercase tracking-[0.2em]">Rider Details</th>
                <th className="px-8 py-6 text-[10px] font-black text-[#40916c] uppercase tracking-[0.2em]">Requested Date</th>
                <th className="px-8 py-6 text-[10px] font-black text-[#40916c] uppercase tracking-[0.2em]">Net Amount</th>
                <th className="px-8 py-6 text-[10px] font-black text-[#40916c] uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-[#40916c] uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#f0f9f4]">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-[#fbfdfb] transition-colors group">
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-4">
                        <div className="bg-[#d8f3dc] p-3 rounded-2xl text-[#1b4332]">
                          <User size={20} />
                        </div>
                        <div>
                          {req.rider ? (
                            <>
                              <p className="font-black text-[#1b4332] uppercase text-sm">
                                {req.rider.fullName || "Unnamed Rider"}
                              </p>
                              <p className="text-[10px] font-bold text-[#40916c]">
                                {req.rider.phoneNumber || "No Phone"}
                              </p>
                            </>
                          ) : (
                            <div className="flex items-center gap-1 text-red-500 font-bold text-[10px] uppercase">
                              <AlertCircle size={12} /> ID: {req._id.substring(0, 8)}... (Link Broken)
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <p className="text-xs font-bold text-gray-400 uppercase">
                        {req.requestedAt ? new Date(req.requestedAt).toLocaleDateString('en-GB', { 
                          day: '2-digit', month: 'short', year: 'numeric' 
                        }) : "N/A"}
                      </p>
                    </td>
                    <td className="px-8 py-8">
                      <p className="text-xl font-black text-[#1b4332] tracking-tighter">
                        Rs. {(req.amount || 0).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-8 py-8">
                      <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                        req.status === 'Completed' ? "bg-green-100 text-green-700" : "bg-yellow-50 text-yellow-700"
                      }`}>
                        {req.status === 'Completed' ? <CheckCircle size={12} /> : <Clock size={12} />}
                        {req.status}
                      </span>
                    </td>
                    <td className="px-8 py-8 text-right">
                      {req.status === 'Pending' ? (
                        <button 
                          onClick={() => handleApprovePayment(req._id)}
                          disabled={processingId === req._id}
                          className="bg-[#1b4332] text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#2d6a4f] transition-all flex items-center gap-2 ml-auto shadow-md active:scale-95 disabled:opacity-50"
                        >
                          {processingId === req._id ? <Loader2 className="animate-spin" size={14} /> : <ShieldCheck size={14} />}
                          Mark Paid
                        </button>
                      ) : (
                        <div className="text-[#40916c] font-black text-[10px] uppercase flex items-center justify-end gap-1 px-4">
                          Settled <ArrowUpRight size={14}/>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-32 text-center">
                    <HandCoins size={60} className="mx-auto text-[#d8f3dc] mb-4 opacity-50" />
                    <p className="font-black text-[#1b4332]/30 uppercase tracking-[0.3em] text-xs">Ledger Clear: No pending rider payouts</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        <div className="mt-8 bg-[#1b4332] p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between shadow-xl gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-[#40916c]" size={28} />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Payout Integrity</p>
                <p className="text-xs font-bold uppercase">All transactions are logged for auditing</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Total Due to Fleet</p>
              <h4 className="text-3xl font-black">Rs. {totalPending.toLocaleString()}</h4>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PayDelivery;