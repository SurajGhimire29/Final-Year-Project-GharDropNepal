import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Store, 
  Search, 
  Trash2, 
  ArrowLeft, 
  Loader2, 
  MapPin, 
  Mail, 
  ExternalLink,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";

const ManageVendor = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      // Fetching users with the role 'vendor'
      const res = await axios.get("http://localhost:3000/admin/fetch-all-customers/?role=vendor", {
        withCredentials: true,
      });
      if (res.data.success) {
        setVendors(res.data.users);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteVendor = async (id) => {
    if (window.confirm("WARNING: Deleting a vendor will also remove all their associated products. Proceed?")) {
      try {
        await axios.delete(`http://localhost:3000/admin/user/${id}`, {
          withCredentials: true,
        });
        setVendors(vendors.filter((v) => v._id !== id));
      } catch (error) {
        alert("Failed to remove vendor.");
      }
    }
  };

  const filteredVendors = vendors.filter((v) =>
    v.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f9f4]">
      <Loader2 className="animate-spin text-[#1b4332]" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0f9f4] p-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <button 
          onClick={() => navigate("/admin-dashboard")}
          className="flex items-center gap-2 text-[#40916c] font-bold mb-4 hover:text-[#1b4332] transition-colors"
        >
          <ArrowLeft size={18} /> BACK TO DASHBOARD
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-[#1b4332] uppercase tracking-tighter flex items-center gap-3">
              <Store size={36} className="text-[#ffb703]" />
              Vendor Details
            </h1>
            <p className="text-[#40916c] font-medium">Verified business partners operating on GharDrop Nepal.</p>
          </div>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search by Store Name or Owner..."
              className="pl-12 pr-6 py-3 rounded-2xl border border-[#d8f3dc] focus:outline-none focus:border-[#40916c] w-64 md:w-96 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Vendor Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.length > 0 ? (
          filteredVendors.map((vendor) => (
            <div key={vendor._id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-[#d8f3dc] hover:border-[#40916c] transition-all group">
              
              {/* Store Image Header */}
              <div className="h-32 bg-[#1b4332] relative">
                <img 
                  src={vendor.storeImage?.url || "https://via.placeholder.com/400x150?text=GharDrop+Partner"} 
                  className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500"
                  alt="Store"
                />
                <div className="absolute -bottom-6 left-6">
                  <div className="h-16 w-16 bg-white rounded-2xl shadow-lg border-4 border-white flex items-center justify-center text-[#1b4332]">
                    <Store size={28} />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 pt-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-black text-[#1b4332] leading-tight">
                      {vendor.storeName || "Unnamed Store"}
                    </h3>
                    <p className="text-xs font-bold text-[#40916c] uppercase">Owner: {vendor.fullName}</p>
                  </div>
                  {vendor.vendorStatus === 'approved' && (
                    <ShieldCheck size={20} className="text-[#ffb703]" />
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3 text-sm text-gray-600">
                    <MapPin size={16} className="mt-1 text-[#40916c]" />
                    <span>{vendor.storeAddress || "No address provided"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Mail size={16} className="text-[#40916c]" />
                    <span className="truncate">{vendor.email}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => navigate(`/admin/vendor/${vendor._id}`)}
                    className="flex-grow flex items-center justify-center gap-2 bg-[#f0f9f4] text-[#1b4332] py-3 rounded-xl font-black text-xs uppercase hover:bg-[#d8f3dc] transition-colors"
                  >
                    View Store <ExternalLink size={14} />
                  </button>
                  <button 
                    onClick={() => deleteVendor(vendor._id)}
                    className="bg-red-50 text-red-400 p-3 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <AlertTriangle size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 font-bold">No registered vendors found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageVendor;