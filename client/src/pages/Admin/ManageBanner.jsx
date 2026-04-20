import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Added for back navigation
import { 
  Trash2, Plus, Image as ImageIcon, Loader2, 
  UploadCloud, Check, X, Clock, ArrowLeft 
} from "lucide-react";
import { toast } from "react-hot-toast";

const ManageBanner = () => {
  const navigate = useNavigate(); // Hook for navigation
  const [banners, setBanners] = useState([]);
  const [requests, setRequests] = useState([]); // State for vendor requests
  const [activeTab, setActiveTab] = useState("live"); // "live" or "requests"
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [newBanner, setNewBanner] = useState({ badge: "", title: "", desc: "" });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch both live banners and pending requests
      const [bannerRes, requestRes] = await Promise.all([
        axios.get("http://localhost:3000/banners"),
        axios.get("http://localhost:3000/admin/banners/requests", { withCredentials: true })
      ]);
      
      if (bannerRes.data.success) setBanners(bannerRes.data.banners);
      if (requestRes.data.success) setRequests(requestRes.data.requests);
    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- Admin Actions for Vendor Requests ---
  const handleRequestAction = async (requestId, status) => {
    try {
      const { data } = await axios.put(
        `http://localhost:3000/admin/banners/request/${requestId}`,
        { status },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success(`Banner ${status === 'approved' ? 'Approved' : 'Rejected'}`);
        fetchData(); // Refresh both lists
      }
    } catch (err) {
      toast.error("Failed to update request status");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleAddBanner = async (e) => {
    e.preventDefault();
    if (!imageFile) return toast.error("Please select an image");
    setUploading(true);
    
    const formData = new FormData();
    formData.append("badge", newBanner.badge);
    formData.append("title", newBanner.title);
    formData.append("desc", newBanner.desc);
    formData.append("image", imageFile);

    try {
      const { data } = await axios.post(
        "http://localhost:3000/admin/banners/add", 
        formData, 
        { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
      );

      if (data.success) {
        setBanners([data.banner, ...banners]);
        setNewBanner({ badge: "", title: "", desc: "" });
        setImageFile(null); setPreview(null);
        toast.success("Banner published!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add banner");
    } finally {
      setUploading(false);
    }
  };

  const deleteBanner = async (id) => {
    if (!window.confirm("Delete this banner from homepage?")) return;
    try {
      await axios.delete(`http://localhost:3000/admin/banners/${id}`, { withCredentials: true });
      setBanners(banners.filter(b => b._id !== id));
      toast.success("Banner deleted successfully");
    } catch (err) {
      toast.error("Error deleting banner");
    }
  };

  return (
    <div className="p-8 bg-[#f0f9f4] min-h-screen">
      <div className="max-w-6xl mx-auto">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="mb-6 flex items-center gap-2 text-[#40916c] font-black uppercase text-xs hover:text-[#1b4332] transition-colors"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-black text-[#1b4332] uppercase tracking-tighter">
              Banner Management
            </h2>
            <p className="text-[#40916c] font-bold">Control what users see on the GharDrop homepage.</p>
          </div>
          
          {/* Tab Switcher */}
          <div className="flex bg-white p-1 rounded-2xl border border-[#d8f3dc]">
            <button 
              onClick={() => setActiveTab("live")}
              className={`px-6 py-2 rounded-xl font-black text-xs uppercase transition-all ${activeTab === "live" ? "bg-[#1b4332] text-white shadow-lg" : "text-[#40916c]"}`}
            >
              Live Banners
            </button>
            <button 
              onClick={() => setActiveTab("requests")}
              className={`px-6 py-2 rounded-xl font-black text-xs uppercase transition-all flex items-center gap-2 ${activeTab === "requests" ? "bg-[#ffb703] text-[#1b4332] shadow-lg" : "text-[#40916c]"}`}
            >
              Requests {requests.length > 0 && <span className="bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px]">{requests.length}</span>}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Form Section */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#d8f3dc] h-fit sticky top-8">
            <h3 className="font-black text-[#1b4332] uppercase mb-6 flex items-center gap-2">
              <Plus size={20} className="text-[#ffb703]" /> Create Admin Slide
            </h3>
            <form onSubmit={handleAddBanner} className="space-y-4">
              <input 
                type="text" placeholder="Badge (e.g. 20% OFF)" 
                className="w-full p-4 rounded-2xl bg-[#f0f9f4] border-none text-sm font-bold"
                value={newBanner.badge} onChange={(e) => setNewBanner({...newBanner, badge: e.target.value})}
                required
              />
              <input 
                type="text" placeholder="Slide Title" 
                className="w-full p-4 rounded-2xl bg-[#f0f9f4] border-none text-sm font-bold"
                value={newBanner.title} onChange={(e) => setNewBanner({...newBanner, title: e.target.value})}
                required
              />
              <textarea 
                placeholder="Description text..." 
                className="w-full p-4 rounded-2xl bg-[#f0f9f4] border-none text-sm font-bold h-24"
                value={newBanner.desc} onChange={(e) => setNewBanner({...newBanner, desc: e.target.value})}
                required
              />
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#b7e4c7] rounded-2xl cursor-pointer bg-[#f0f9f4]">
                {preview ? <img src={preview} alt="Preview" className="h-full w-full object-cover rounded-2xl" /> : <UploadCloud className="text-[#40916c]" />}
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
              <button disabled={uploading} className="w-full py-4 bg-[#1b4332] text-white rounded-2xl font-black uppercase hover:bg-[#ffb703] hover:text-[#1b4332] transition-all disabled:opacity-50">
                {uploading ? "Uploading..." : "Publish Banner"}
              </button>
            </form>
          </div>

          {/* List Section */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#1b4332]" size={40} /></div>
            ) : activeTab === "live" ? (
              // --- LIVE BANNERS VIEW ---
              banners.map((banner) => (
                <div key={banner._id} className="bg-white p-5 rounded-[2rem] border border-[#d8f3dc] flex gap-6 items-center group">
                  <div className="h-20 w-32 shrink-0 overflow-hidden rounded-2xl">
                    <img src={banner.image} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-grow">
                    <span className="bg-[#d8f3dc] text-[#1b4332] px-2 py-0.5 rounded text-[9px] font-black uppercase">{banner.badge}</span>
                    <h4 className="font-bold text-[#1b4332] mt-1">{banner.title}</h4>
                  </div>
                  <button onClick={() => deleteBanner(banner._id)} className="p-4 text-red-400 hover:text-red-600"><Trash2 size={20} /></button>
                </div>
              ))
            ) : (
              // --- VENDOR REQUESTS VIEW ---
              requests.length === 0 ? (
                <div className="bg-white p-10 rounded-[2.5rem] text-center text-[#40916c] font-bold">No pending requests from vendors.</div>
              ) : (
                requests.map((req) => (
                  <div key={req._id} className="bg-white p-6 rounded-[2rem] border-2 border-[#ffb703]/30 shadow-sm flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <img src={req.image} className="w-32 h-20 object-cover rounded-2xl" alt="" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-[#ffb703] text-[#1b4332] px-2 py-0.5 rounded text-[9px] font-black uppercase">{req.badge}</span>
                            <span className="text-[10px] font-bold text-[#40916c] flex items-center gap-1"><Clock size={10}/> Pending</span>
                          </div>
                          <h4 className="font-black text-[#1b4332]">{req.title}</h4>
                          <p className="text-xs font-bold text-[#40916c]">Vendor: {req.vendorName || "Unknown Vendor"}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                              req.paymentStatus === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {req.paymentStatus === 'Completed' ? 'Paid' : 'Unpaid (Pending Charge)'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleRequestAction(req._id, "approved")}
                          className="p-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all"
                        >
                          <Check size={20} />
                        </button>
                        <button 
                          onClick={() => handleRequestAction(req._id, "rejected")}
                          className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 bg-[#f0f9f4] p-3 rounded-xl">"{req.desc}"</p>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageBanner;