import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Banknote, Search, CheckCircle, Clock, Store, 
  Loader2, ChevronLeft, ExternalLink, ShieldCheck, AlertCircle 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const PayVendor = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState(null);

  // Fetch Requests on Load
  const fetchRequests = async () => {
    try {
      const res = await axios.get("http://localhost:3000/admin/withdrawals?role=vendor", { 
        withCredentials: true 
      });
      if (res.data.success) setRequests(res.data.withdrawals);
    } catch (error) {
      console.error("Payout Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Handle Payment Finalization
  const handleApprovePayment = async (id) => {
    const confirmTransfer = window.confirm(
      "SECURITY VERIFICATION:\n\nHave you manually transferred the 90% share to the vendor's bank account?\nClick OK only if the transaction is successful."
    );
    
    if (!confirmTransfer) return;
    
    setProcessingId(id);
    try {
      const res = await axios.put(`http://localhost:3000/admin/withdrawal/${id}`, 
        { status: "Completed" }, 
        { withCredentials: true }
      );
      if (res.data.success) {
        // Optimistic UI update or refresh
        fetchRequests();
      }
    } catch (error) {
      alert("Failed to update status. Please check your connection.");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRequests = requests.filter(req => 
    req.vendor?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPendingPayout = filteredRequests.reduce((acc, curr) => 
    curr.status === 'Pending' ? acc + curr.amount : acc, 0
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f9f4]">
        <Loader2 className="animate-spin text-[#1b4332]" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f9f4] p-4 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="text-left">
            <button 
              onClick={() => navigate("/admin-dashboard")}
              className="flex items-center gap-2 text-[#1b4332] font-black text-[10px] uppercase tracking-widest mb-4 hover:gap-3 transition-all"
            >
              <ChevronLeft size={14} /> System Dashboard
            </button>
            <h1 className="text-4xl font-black text-[#1b4332] uppercase tracking-tighter flex items-center gap-3">
              <Banknote className="text-[#ffb703]" size={36} /> Vendor <span className="text-[#40916c]">Settlements</span>
            </h1>
            <p className="text-[#1b4332]/60 font-bold text-xs mt-1 uppercase tracking-widest italic flex items-center gap-2">
              <AlertCircle size={12}/> Review and process 90/10 split payouts
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#40916c]" size={18} />
            <input 
              type="text"
              placeholder="Search Vendor Name..."
              className="w-full pl-12 pr-4 py-4 rounded-3xl border-2 border-[#d8f3dc] focus:border-[#40916c] outline-none font-bold text-sm transition-all shadow-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Payouts Table */}
        <div className="bg-white rounded-[3.5rem] border-4 border-[#d8f3dc] overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f0f9f4]/50 border-b-2 border-[#f0f9f4]">
                <th className="px-10 py-6 text-[10px] font-black text-[#40916c] uppercase tracking-[0.2em]">Merchant Info</th>
                <th className="px-10 py-6 text-[10px] font-black text-[#40916c] uppercase tracking-[0.2em]">Request Date</th>
                <th className="px-10 py-6 text-[10px] font-black text-[#40916c] uppercase tracking-[0.2em]">Net Payout</th>
                <th className="px-10 py-6 text-[10px] font-black text-[#40916c] uppercase tracking-[0.2em]">Transaction Type</th>
                <th className="px-10 py-6 text-[10px] font-black text-[#40916c] uppercase tracking-[0.2em]">Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-[#40916c] uppercase tracking-[0.2em] text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#f0f9f4]">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-[#fbfdfb] transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="bg-[#1b4332] p-3 rounded-2xl text-[#ffb703]">
                          <Store size={20} />
                        </div>
                        <div>
                          <p className="font-black text-[#1b4332] uppercase text-sm leading-none mb-1">
                            {req.vendor?.fullName || "Legacy Merchant"}
                          </p>
                          <p className="text-[10px] font-bold text-[#40916c] uppercase tracking-tighter">
                            Ref: {req._id.slice(-8)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <p className="text-xs font-black text-gray-400 uppercase">
                        {new Date(req.requestedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-10 py-8">
                      <p className="text-2xl font-black text-[#1b4332] tracking-tighter">
                        Rs. {req.amount.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
                        req.type === 'Banner Fee' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {req.type || 'Payout'}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                        req.status === 'Completed' ? "bg-green-100 text-green-700" : "bg-orange-50 text-orange-600"
                      }`}>
                        {req.status === 'Completed' ? <CheckCircle size={12} /> : <Clock size={12} />}
                        {req.status}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      {req.status === 'Pending' ? (
                        <button 
                          onClick={() => handleApprovePayment(req._id)}
                          disabled={processingId === req._id}
                          className="bg-[#1b4332] text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] hover:bg-[#2d6a4f] transition-all flex items-center gap-2 ml-auto shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50"
                        >
                          {processingId === req._id ? <Loader2 className="animate-spin" size={14} /> : <ShieldCheck size={14} />}
                          Finalize Payout
                        </button>
                      ) : (
                        <div className="text-[#40916c] font-black text-[10px] uppercase flex items-center justify-end gap-1 px-4">
                          Audit Logged <ExternalLink size={12}/>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-10 py-32 text-center">
                    <div className="opacity-20 flex flex-col items-center">
                      <Banknote size={80} className="mb-4 text-[#1b4332]" />
                      <p className="font-black text-[#1b4332] uppercase tracking-[0.4em] text-xs">Clear Ledger: No pending settlements</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary Card */}
        <div className="mt-10 bg-white border-4 border-[#d8f3dc] p-8 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
           <div className="flex items-center gap-4">
              <div className="bg-[#ffb703] p-4 rounded-3xl text-[#1b4332]">
                <ShieldCheck size={32} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-[#40916c] uppercase tracking-widest">Treasury Protocol 2.0</p>
                <p className="text-sm font-black text-[#1b4332] uppercase italic">Automated 10% commission retention applied to total volume</p>
              </div>
           </div>
           <div className="text-right">
              <p className="text-[10px] font-black text-[#40916c] uppercase tracking-widest mb-1">Unpaid Liability</p>
              <h4 className="text-3xl font-black text-[#1b4332]">
                Rs. {totalPendingPayout.toLocaleString()}
              </h4>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PayVendor;