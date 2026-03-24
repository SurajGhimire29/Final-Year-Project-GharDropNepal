import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  ShieldCheck, 
  XCircle, 
  ExternalLink, 
  Loader2, 
  ArrowLeft,
  User,
  MapPin,
  Truck,
  Store,
  CheckCircle2,
  FileText
} from "lucide-react";

const VerificationHub = () => {
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/admin/pending-approvals", {
        withCredentials: true,
      });
      if (res.data.success) {
        setPendingUsers(res.data.pendingUsers);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (userId, status) => {
    const confirmMsg = status === 'approved' 
      ? "Approve this partner for GharDrop?" 
      : "Reject this application?";
    
    if (!window.confirm(confirmMsg)) return;

    setActionLoading(userId);
    try {
      const res = await axios.put(
        `http://localhost:3000/admin/approve-user/${userId}`,
        { status }, 
        { withCredentials: true }
      );
      
      if (res.data.success) {
        setPendingUsers((prev) => prev.filter((u) => u._id !== userId));
      }
    } catch (error) {
      alert("Update failed: " + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f9f4]">
      <Loader2 className="animate-spin text-[#1b4332]" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0f9f4] p-4 md:p-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-10">
        <button 
          onClick={() => navigate("/admin-dashboard")}
          className="flex items-center gap-2 text-[#40916c] font-bold mb-4 hover:text-[#1b4332] transition-all"
        >
          <ArrowLeft size={18} /> BACK TO PANEL
        </button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-4xl font-black text-[#1b4332] uppercase tracking-tighter">
              Verification Hub
            </h1>
            <p className="text-[#40916c] font-medium">Verify Storefronts and Driver Licenses</p>
          </div>
          <div className="bg-white px-6 py-4 rounded-3xl border border-[#d8f3dc] shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase">Pending</p>
            <p className="text-2xl font-black text-[#1b4332]">{pendingUsers.length}</p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="max-w-5xl mx-auto space-y-6">
        {pendingUsers.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-[#b7e4c7]">
            <CheckCircle2 size={64} className="mx-auto text-[#b7e4c7] mb-4" />
            <h2 className="text-2xl font-black text-[#1b4332]">All Clear!</h2>
            <p className="text-gray-500">No pending verifications at the moment.</p>
          </div>
        ) : (
          pendingUsers.map((user) => {
            // Determine which image to show based on role
            const displayImage = user.role === 'vendor' 
              ? user.storeImage?.url 
              : user.deliveryLicenseImage?.url;

            const imageLabel = user.role === 'vendor' ? "Store Image" : "Driver License";

            return (
              <div key={user._id} className="bg-white rounded-[2.5rem] shadow-sm border border-[#d8f3dc] overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-md">
                
                {/* Information Left Panel */}
                <div className="p-8 md:w-2/5 bg-[#fcfdfc] border-b md:border-b-0 md:border-r border-[#f0f9f4]">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 bg-[#1b4332] rounded-2xl flex items-center justify-center text-[#ffb703]">
                      {user.role === 'vendor' ? <Store size={24} /> : <Truck size={24} />}
                    </div>
                    <div>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${user.role === 'vendor' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                        {user.role}
                      </span>
                      <h3 className="text-lg font-black text-[#1b4332]">{user.fullName}</h3>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <User size={14} /> <span>{user.email}</span>
                    </div>

                    {user.role === 'vendor' ? (
                      <div className="bg-white p-4 rounded-2xl border border-[#d8f3dc]">
                        <p className="text-[10px] font-black text-[#40916c] uppercase mb-1">Shop Details</p>
                        <p className="font-bold text-[#1b4332]">{user.storeName}</p>
                        <p className="text-xs text-gray-500 flex items-start gap-1 mt-1">
                          <MapPin size={12} /> {user.storeAddress}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-white p-4 rounded-2xl border border-[#d8f3dc]">
                        <p className="text-[10px] font-black text-[#40916c] uppercase mb-1">Vehicle Details</p>
                        <p className="font-bold text-[#1b4332] uppercase">{user.vehicleType} — {user.vehicleNumber}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Document Review Right Panel */}
                <div className="p-8 flex-grow flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest flex items-center gap-2">
                      <FileText size={14} /> {imageLabel}
                    </p>
                    
                    <div className="group relative w-full h-56 bg-gray-50 rounded-2xl border border-[#d8f3dc] overflow-hidden">
                      <img 
                        src={displayImage} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        alt={imageLabel}
                      />
                      <a 
                        href={displayImage} 
                        target="_blank" rel="noreferrer"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-bold text-sm gap-2"
                      >
                        <ExternalLink size={20} /> VIEW FULL DOCUMENT
                      </a>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex items-center gap-3">
                    <button 
                      disabled={actionLoading === user._id}
                      onClick={() => handleApproval(user._id, "approved")}
                      className="flex-grow bg-[#1b4332] hover:bg-[#081c15] text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {actionLoading === user._id ? <Loader2 className="animate-spin" size={20} /> : "Approve Partner"}
                    </button>
                    <button 
                      disabled={actionLoading === user._id}
                      onClick={() => handleApproval(user._id, "rejected")}
                      className="bg-red-50 text-red-600 hover:bg-red-100 px-6 py-4 rounded-2xl font-black uppercase tracking-widest transition-all disabled:opacity-50"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default VerificationHub;