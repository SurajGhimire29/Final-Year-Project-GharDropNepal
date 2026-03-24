import React, { useEffect, useState } from 'react';
import { User, Package, MapPin, Settings, LogOut, ChevronRight, Camera, Bell, Loader2, Lock } from 'lucide-react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const isAuthenticated = localStorage.getItem("userRole");

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data } = await axios.get('http://localhost:3000/user/profile', {
          withCredentials: true,
        });

        if (data.success) {
          setUser(data.user);
          // Sync local storage with latest data from server
          localStorage.setItem("userName", data.user.fullName);
          if (data.user.avatar?.url) {
            localStorage.setItem("userAvatar", data.user.avatar.url);
          }
        }
      } catch (error) {
        console.error("Profile Fetch Error:", error.response?.data || error.message);
        navigate('/signin');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, isAuthenticated]);

  // --- UPDATED IMAGE UPLOAD LOGIC ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setUploading(true);
      const { data } = await axios.put(
        'http://localhost:3000/user/update-avatar',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        }
      );

      if (data.success) {
        // 1. Update the local state for THIS page
        setUser({ ...user, avatar: data.avatar });

        // 2. CRITICAL: Update localStorage so the Navbar sees the NEW image
        localStorage.setItem("userAvatar", data.avatar.url);

        // 3. Trigger a storage event so Navbar updates immediately
        window.dispatchEvent(new Event("storage"));

        alert("Profile picture updated successfully!");
      }
    } catch (error) {
      console.error("Upload Error:", error.response?.data || error.message);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:3000/signout', { withCredentials: true });
      localStorage.clear();
      navigate('/signin');
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f0f9f4] flex items-center justify-center">
      <Loader2 className="animate-spin text-[#1b4332]" size={40} />
    </div>
  );

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-[#f0f9f4] flex flex-col items-center justify-center px-6">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-[#d8f3dc] text-center max-w-sm w-full">
        <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
          <Lock size={40} />
        </div>
        <h2 className="text-2xl font-black text-[#1b4332] mb-2 uppercase tracking-tighter">Login Required</h2>
        <p className="text-gray-500 font-medium mb-8">Please sign in to access your GharDrop profile.</p>
        <Link 
          to="/signin" 
          className="block w-full bg-[#1b4332] text-[#ffb703] py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-[#2d6a4f] transition-all"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );

  const menuItems = [
    { icon: <Package size={20} />, label: "My Orders", color: "text-blue-500", bg: "bg-blue-50" },
    { icon: <Bell size={20} />, label: "Notifications", color: "text-purple-500", bg: "bg-purple-50" },
    { icon: <MapPin size={20} />, label: "Delivery Addresses", color: "text-orange-500", bg: "bg-orange-50" },
    { icon: <Settings size={20} />, label: "Account Settings", color: "text-gray-500", bg: "bg-gray-100" },
  ];

  return (
    <div className="min-h-screen bg-[#f0f9f4] pb-20">
      <div className="bg-[#1b4332] pt-16 pb-32 px-6 rounded-b-[3.5rem] shadow-xl">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
          
          {/* Avatar Section */}
          <div className="relative">
            <div className="w-36 h-36 rounded-full border-4 border-[#ffb703] overflow-hidden bg-white shadow-2xl flex items-center justify-center text-[#1b4332]">
              {uploading ? (
                <Loader2 className="animate-spin text-[#1b4332]" size={40} />
              ) : user?.avatar?.url ? (
                <img src={user.avatar.url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="bg-[#1b4332] w-full h-full flex items-center justify-center text-[#ffb703] text-4xl font-black">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <input 
              type="file" 
              id="avatarInput" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageUpload}
              disabled={uploading}
            />
            
            <label 
              htmlFor="avatarInput" 
              className={`absolute bottom-2 right-2 bg-[#ffb703] p-2.5 rounded-full text-[#1b4332] transition-all shadow-lg border-2 border-white cursor-pointer ${uploading ? 'opacity-50' : 'hover:scale-110'}`}
            >
              <Camera size={20} />
            </label>
          </div>

          <div className="text-center md:text-left text-white">
            <h1 className="text-4xl font-black mb-2 tracking-tight">
              {user?.fullName || "GharDrop User"}
            </h1>
            <p className="text-[#95d5b2] text-lg font-medium mb-4">{user?.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="bg-[#2d6a4f] px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border border-[#40916c]">
                {user?.role || 'Customer'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-16">
        <div className="grid grid-cols-3 gap-6 mb-10">
          {[
            { label: "Orders", value: user?.orders?.length || "0" },
            { label: "Phone", value: user?.phoneNumber ? String(user.phoneNumber).slice(-4) : "N/A" },
            { label: "GharPoints", value: "0" }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2.5rem] text-center shadow-md border border-[#d8f3dc]">
              <p className="text-2xl md:text-3xl font-black text-[#1b4332]">{stat.value}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl border border-[#d8f3dc] overflow-hidden mb-8">
          <div className="divide-y divide-[#f0f9f4]">
            {menuItems.map((item, index) => (
              <button key={index} className="w-full flex items-center justify-between p-6 hover:bg-[#f8fdfa] transition-all group">
                <div className="flex items-center gap-5">
                  <div className={`${item.bg} ${item.color} p-4 rounded-[1.5rem] group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <span className="font-extrabold text-[#1b4332] text-lg">{item.label}</span>
                </div>
                <ChevronRight size={24} className="text-gray-300 group-hover:text-[#40916c]" />
              </button>
            ))}
          </div>

          <div className="p-6 bg-gray-50/50">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 p-5 text-red-500 font-black text-lg hover:bg-red-50 rounded-[2rem] transition-all"
            >
              <LogOut size={22} />
              <span>LOG OUT</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;