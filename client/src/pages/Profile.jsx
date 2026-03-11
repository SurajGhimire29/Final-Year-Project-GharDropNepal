import React from 'react';
import { User, Package, MapPin, Heart, Settings, LogOut, ChevronRight, Camera, Bell } from 'lucide-react';

const Profile = () => {
  // Mock user data 
  const user = {
    fullName: "Aryan Kumar",
    email: "aryan@example.com",
    phone: "+977 9800000000",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
    joined: "March 2026"
  };

  const menuItems = [
    { icon: <Package size={20} />, label: "My Orders", color: "text-blue-500", bg: "bg-blue-50" },
    { icon: <Bell size={20} />, label: "Notifications", color: "text-purple-500", bg: "bg-purple-50" },
    { icon: <MapPin size={20} />, label: "Delivery Addresses", color: "text-orange-500", bg: "bg-orange-50" },
    { icon: <Settings size={20} />, label: "Account Settings", color: "text-gray-500", bg: "bg-gray-100" },
  ];

  return (
    <div className="min-h-screen bg-[#f0f9f4] pb-20">
      {/* Top Header Section */}
      <div className="bg-[#1b4332] pt-16 pb-32 px-6 rounded-b-[3.5rem] shadow-xl">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
          
          {/* Profile Picture */}
          <div className="relative">
            <div className="w-36 h-36 rounded-full border-4 border-[#ffb703] overflow-hidden bg-white shadow-2xl">
              <img src={user.avatar} alt="User Profile" className="w-full h-full object-cover" />
            </div>
            <button className="absolute bottom-2 right-2 bg-[#ffb703] p-2.5 rounded-full text-[#1b4332] hover:scale-110 transition-transform shadow-lg border-2 border-white">
              <Camera size={20} />
            </button>
          </div>

          {/* User Details */}
          <div className="text-center md:text-left text-white">
            <h1 className="text-4xl font-black mb-2 tracking-tight">{user.fullName}</h1>
            <p className="text-[#95d5b2] text-lg font-medium mb-4">{user.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="bg-[#2d6a4f] px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border border-[#40916c]">
                Verified Customer
              </span>
              <span className="bg-white/10 px-5 py-2 rounded-2xl text-xs font-bold text-white/80">
                Joined {user.joined}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Body Content */}
      <div className="max-w-4xl mx-auto px-6 -mt-16">
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          {[
            { label: "Total Orders", value: "14" },
            { label: "Saved Items", value: "8" },
            { label: "GharPoints", value: "850" }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2.5rem] text-center shadow-md border border-[#d8f3dc] transform hover:-translate-y-1 transition-all">
              <p className="text-3xl font-black text-[#1b4332]">{stat.value}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Navigation Menu */}
        <div className="bg-white rounded-[3rem] shadow-2xl border border-[#d8f3dc] overflow-hidden mb-8">
          <div className="p-6 border-b border-[#f0f9f4]">
            <h2 className="text-[#1b4332] font-black uppercase text-sm tracking-widest px-2">Account Dashboard</h2>
          </div>
          
          <div className="divide-y divide-[#f0f9f4]">
            {menuItems.map((item, index) => (
              <button 
                key={index}
                className="w-full flex items-center justify-between p-6 hover:bg-[#f8fdfa] transition-all group"
              >
                <div className="flex items-center gap-5">
                  <div className={`${item.bg} ${item.color} p-4 rounded-[1.5rem] group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <span className="font-extrabold text-[#1b4332] text-lg">
                    {item.label}
                  </span>
                </div>
                <ChevronRight size={24} className="text-gray-300 group-hover:text-[#40916c] transition-colors" />
              </button>
            ))}
          </div>

          {/* Logout Section */}
          <div className="p-6 bg-gray-50/50">
            <button className="w-full flex items-center justify-center gap-3 p-5 text-red-500 font-black text-lg hover:bg-red-50 rounded-[2rem] border-2 border-transparent hover:border-red-100 transition-all">
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