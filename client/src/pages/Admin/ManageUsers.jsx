import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Users, 
  Search, 
  Trash2, 
  ArrowLeft, 
  Loader2, 
  Mail, 
  Calendar,
  UserCheck,
  UserMinus,
  RefreshCcw
} from "lucide-react";

const ManageUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {  
    try {
      setLoading(true);
      // Fetch only customers using the role query parameter
      const res = await axios.get("http://localhost:3000/admin/fetch-all-customers?role=customer", {
        withCredentials: true,
      });
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // INTEGRATED: Toggle User Verification status
  const toggleVerification = async (id, currentStatus) => {
    setProcessingId(id);
    try {
      const res = await axios.put(
        `http://localhost:3000/admin/user/update-status/${id}`,
        { isVerified: !currentStatus },
        { withCredentials: true }
      );
      
      if (res.data.success) {
        // Update local state instantly
        setUsers(users.map(u => u._id === id ? { ...u, isVerified: !currentStatus } : u));
      }
    } catch (error) {
      alert("Failed to update user status.");
    } finally {
      setProcessingId(null);
    }
  };

  // INTEGRATED: Permanent User Removal
  const deleteUser = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) {
      try {
        const res = await axios.delete(`http://localhost:3000/admin/user/remove/${id}`, {
          withCredentials: true,
        });
        if (res.data.success) {
          setUsers(users.filter((u) => u._id !== id));
        }
      } catch (error) {
        alert("Failed to delete user. Check console for details.");
      }
    }
  };

  const filteredUsers = users.filter((user) =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
              <Users size={36} className="text-[#ffb703]" />
              User Details
            </h1>
            <p className="text-[#40916c] font-medium">Manage all registered customers on the GharDrop Nepal platform.</p>
          </div>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search by name or email..."
              className="pl-12 pr-6 py-3 rounded-2xl border border-[#d8f3dc] focus:outline-none focus:border-[#40916c] w-64 md:w-96 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="max-w-7xl mx-auto bg-white rounded-[2.5rem] shadow-sm border border-[#d8f3dc] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fcfdfc] border-b border-[#f0f9f4]">
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Information</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Joined Date</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Verification Status</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f9f4]">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-[#f0f9f4]/30 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-[#1b4332] text-[#ffb703] rounded-full flex items-center justify-center font-bold">
                          {user.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-[#1b4332]">{user.fullName}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">ID: {user._id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={14} className="text-[#40916c]" />
                        {user.email}
                      </div>
                    </td>
                    <td className="p-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-[#40916c]" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-6">
                      <button 
                        onClick={() => toggleVerification(user._id, user.isVerified)}
                        disabled={processingId === user._id}
                        className="hover:scale-105 transition-transform disabled:opacity-50"
                      >
                        {user.isVerified ? (
                          <span className="px-3 py-1 bg-[#f0f9f4] text-[#1b4332] rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit">
                            {processingId === user._id ? <RefreshCcw size={12} className="animate-spin" /> : <UserCheck size={12} />} 
                            Verified
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-red-50 text-red-500 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit">
                            {processingId === user._id ? <RefreshCcw size={12} className="animate-spin" /> : <UserMinus size={12} />} 
                            Unverified
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="p-6">
                      <button 
                        onClick={() => deleteUser(user._id)}
                        className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Remove User"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-20 text-center text-gray-400 font-bold">
                    No customers found matching that search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;