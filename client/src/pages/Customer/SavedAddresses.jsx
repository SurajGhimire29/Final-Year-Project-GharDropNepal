import React, { useState, useEffect } from "react";
import axios from "axios";
import { MapPin, Phone, ArrowLeft, Loader2, Save, Home, Building } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const SavedAddresses = () => {
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("Pokhara");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const API_URL = "http://localhost:3000";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/user/profile`, {
          withCredentials: true,
        });
        if (data.success) {
          setAddressLine(data.user.addressLine || "");
          setCity(data.user.city || "Pokhara");
          setPhoneNumber(data.user.phoneNumber || "");
        }
      } catch (error) {
        console.error("Profile Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axios.put(
        `${API_URL}/user/address`,
        { addressLine, city, phoneNumber },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success("Address Saved!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f9f4] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#1b4332]" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f9f4] pb-20 font-sans">
      <div className="bg-[#1b4332] pt-20 pb-28 px-6 rounded-b-[3.5rem] shadow-xl relative overflow-hidden text-center text-white">
        <button onClick={() => navigate(-1)} className="absolute top-8 left-8 text-white/60 hover:text-white transition-all flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]">
            <ArrowLeft size={16} /> Back
        </button>
        <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter relative z-10">
          Saved <span className="text-[#ffb703]">Addresses</span>
        </h1>
        <p className="text-[#b7e4c7] font-medium mt-2 opacity-80 uppercase tracking-widest text-[10px]">Manage your default delivery points</p>
      </div>

      <div className="max-w-xl mx-auto px-6 -mt-12 relative z-20">
        <form onSubmit={handleSave} className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-[#d8f3dc] space-y-8">
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#40916c] ml-2 flex items-center gap-2">
                <Home size={12}/> Default Address (House/Area)
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18}/>
                <input 
                  type="text" required
                  value={addressLine} onChange={(e) => setAddressLine(e.target.value)}
                  className="w-full bg-[#f8fdfa] border border-[#d8f3dc] p-4 pl-12 rounded-2xl focus:outline-none focus:border-[#40916c] focus:ring-1 focus:ring-[#40916c] transition-all font-bold text-[#1b4332]"
                  placeholder="e.g. House 45, Prithvi Chowk"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#40916c] ml-2 flex items-center gap-2">
                <Building size={12}/> City
              </label>
              <input 
                type="text" required
                value={city} onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#f8fdfa] border border-[#d8f3dc] p-4 rounded-2xl focus:outline-none focus:border-[#40916c] focus:ring-1 focus:ring-[#40916c] transition-all font-bold text-[#1b4332]"
                placeholder="Pokhara"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#40916c] ml-2 flex items-center gap-2">
                <Phone size={12}/> Contact Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18}/>
                <input 
                  type="text" required
                  value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-[#f8fdfa] border border-[#d8f3dc] p-4 pl-12 rounded-2xl focus:outline-none focus:border-[#40916c] focus:ring-1 focus:ring-[#40916c] transition-all font-bold text-[#1b4332]"
                  placeholder="98XXXXXXXX"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="w-full bg-[#ffb703] text-[#1b4332] py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#e0a000] transition-all shadow-xl disabled:opacity-70 active:scale-95"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Save Changes</>}
          </button>

          <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest px-4">
            * This information will be used to automatically pre-fill your checkout details for a faster experience.
          </p>
        </form>
      </div>
    </div>
  );
};

export default SavedAddresses;
