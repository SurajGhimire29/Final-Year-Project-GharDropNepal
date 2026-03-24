import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Truck, 
  Search, 
  Trash2, 
  ArrowLeft, 
  Loader2, 
  MapPin, 
  Phone, 
  UserX,
  UserCheck,
  ShieldAlert
} from "lucide-react";

const ManageDelivery = () => {
  const navigate = useNavigate();
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDeliveryPersonnel();
  }, []);

  const fetchDeliveryPersonnel = async () => {
    try {
      // Assuming your backend can filter by role
      const res = await axios.get("http://localhost:3000/admin/fetch-all-customers?role=deliveryBoy", {
        withCredentials: true,
      });
      if (res.data.success) {
        setDeliveryBoys(res.data.users);
      }
    } catch (error) {
      console.error("Error fetching delivery personnel:", error);
    } finally {
      setLoading(false);
    }
  };

  const removePersonnel = async (id) => {
    if (window.confirm("Are you sure you want to remove this delivery person? They will lose access to the GharDrop Partner App.")) {
      try {
        await axios.delete(`http://localhost:3000/admin/user/${id}`, {
          withCredentials: true,
        });
        setDeliveryBoys(deliveryBoys.filter((boy) => boy._id !== id));
      } catch (error) {
        alert("Failed to remove personnel. Ensure you have admin privileges.");
      }
    }
  };

  const filteredBoys = deliveryBoys.filter((boy) =>
    boy.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    boy.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase())
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
              <Truck size={36} className="text-[#ffb703]" />
              Manage Delivery
            </h1>
            <p className="text-[#40916c] font-medium">Manage and monitor active delivery partners across Nepal.</p>
          </div>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search by name or vehicle number..."
              className="pl-12 pr-6 py-3 rounded-2xl border border-[#d8f3dc] focus:outline-none focus:border-[#40916c] w-64 md:w-96 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Grid Layout for Delivery Boys */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBoys.length === 0 ? (
          <div className="col-span-full bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-[#b7e4c7]">
            <UserX size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 font-bold">No delivery personnel found.</p>
          </div>
        ) : (
          filteredBoys.map((boy) => (
            <div key={boy._id} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-[#d8f3dc] hover:border-[#40916c] transition-all group relative overflow-hidden">
              
              {/* Status Badge */}
              <div className="absolute top-6 right-6">
                {boy.vendorStatus === 'approved' ? (
                  <span className="flex items-center gap-1 text-[10px] font-black text-[#40916c] bg-[#f0f9f4] px-3 py-1 rounded-full uppercase">
                    <UserCheck size={12} /> Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-black text-orange-500 bg-orange-50 px-3 py-1 rounded-full uppercase">
                    <ShieldAlert size={12} /> Pending
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 bg-[#1b4332] rounded-2xl flex items-center justify-center text-[#ffb703] font-black text-xl">
                  {boy.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-[#1b4332] text-lg">{boy.fullName}</h3>
                  <p className="text-xs text-gray-400">Partner since {new Date(boy.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="p-2 bg-gray-50 rounded-lg"><Phone size={14} /></div>
                  {boy.email}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="p-2 bg-gray-50 rounded-lg"><Truck size={14} /></div>
                  <span className="font-bold text-[#1b4332]">{boy.vehicleType}</span> — {boy.vehicleNumber}
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => navigate(`/admin/delivery/${boy._id}`)}
                  className="flex-grow bg-[#f0f9f4] text-[#1b4332] py-3 rounded-xl font-black text-xs uppercase hover:bg-[#d8f3dc] transition-colors"
                >
                  View Performance
                </button>
                <button 
                  onClick={() => removePersonnel(boy._id)}
                  className="bg-red-50 text-red-500 p-3 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                  title="Remove Partner"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageDelivery;