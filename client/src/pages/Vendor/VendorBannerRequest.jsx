import React, { useState, useEffect } from "react";
import axios from "axios";
import { UploadCloud, Loader2, Clock, CheckCircle, XCircle, Send } from "lucide-react";

const VendorBannerRequest = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    badge: "",
    title: "",
    desc: "",
    shopName: "" // The vendor identifies their shop
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Fetch only THIS vendor's requests
  const fetchMyRequests = async () => {
    try {
      const { data } = await axios.get("http://localhost:3000/vendor/my-banners", { withCredentials: true });
      if (data.success) setRequests(data.banners);
    } catch (err) {
      console.error("Error fetching requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyRequests(); }, []);

  const handleFile = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return alert("Please upload a banner design");

    setSubmitting(true);
    const data = new FormData();
    data.append("badge", formData.badge);
    data.append("title", formData.title);
    data.append("desc", formData.desc);
    data.append("shopName", formData.shopName);
    data.append("image", imageFile);

    try {
      const res = await axios.post("http://localhost:3000/vendor/banners/request", data, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        setRequests([res.data.banner, ...requests]);
        setFormData({ badge: "", title: "", desc: "", shopName: "" });
        setPreview(null);
        alert("Request sent! Waiting for Admin approval.");
      }
    } catch (err) {
      alert("Failed to send request. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#1b4332] uppercase tracking-tighter">Banner Advertising</h1>
            <p className="text-slate-500 font-medium">Request a spot on the GharDrop homepage</p>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-xs font-bold text-slate-400 uppercase">Available Credits</p>
            <p className="text-xl font-black text-[#1b4332]">Unlimited <span className="text-[10px] text-emerald-500 font-bold">(Beta)</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: REQUEST FORM */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
              <h2 className="text-xl font-black text-[#1b4332] uppercase mb-6 flex items-center gap-2">
                <Send size={20} className="text-[#ffb703]" /> New Slot Request
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Shop Identity</label>
                  <input 
                    type="text" placeholder="e.g. Kathmandu Organic Farm" 
                    className="w-full p-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#1b4332] transition-all font-bold text-sm"
                    value={formData.shopName} onChange={(e) => setFormData({...formData, shopName: e.target.value})} required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Badge Text</label>
                    <input 
                      type="text" placeholder="20% OFF" 
                      className="w-full p-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#1b4332] font-bold text-sm"
                      value={formData.badge} onChange={(e) => setFormData({...formData, badge: e.target.value})} required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Title</label>
                    <input 
                      type="text" placeholder="Fresh Apples" 
                      className="w-full p-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#1b4332] font-bold text-sm"
                      value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Short Description</label>
                    <textarea 
                      placeholder="Tell customers why they should click..." 
                      className="w-full p-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#1b4332] font-bold text-sm h-24"
                      value={formData.desc} onChange={(e) => setFormData({...formData, desc: e.target.value})} required
                    />
                </div>

                <div className="relative">
                  <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-slate-200 rounded-3xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors overflow-hidden">
                    {preview ? (
                      <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <UploadCloud className="text-slate-400 mx-auto mb-2" size={32} />
                        <p className="text-[10px] font-black text-slate-400 uppercase">Banner Design (1920x600)</p>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleFile} />
                  </label>
                </div>

                <button 
                  disabled={submitting}
                  className="w-full py-5 bg-[#1b4332] text-white rounded-2xl font-black uppercase hover:bg-[#ffb703] hover:text-[#1b4332] transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" /> : "Submit for Approval"}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT: TRACKING STATUS */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-sm font-black text-[#1b4332] uppercase tracking-widest">Request History</h2>
                <span className="text-[10px] font-bold text-slate-400 italic">Sorted by recent</span>
            </div>

            <div className="space-y-4">
              {loading ? <Loader2 className="animate-spin mx-auto mt-20 text-slate-300" /> : requests.map((req) => (
                <div key={req._id} className="bg-white p-4 rounded-[2rem] border border-slate-100 flex items-center gap-6 group hover:border-[#1b4332]/20 transition-all">
                  <div className="h-20 w-32 rounded-2xl overflow-hidden shadow-inner shrink-0">
                    <img src={req.image} className="w-full h-full object-cover" alt="" />
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-black text-[#1b4332] uppercase text-sm truncate max-w-[150px]">{req.title}</h4>
                      {req.status === 'pending' && <span className="flex items-center gap-1 text-[9px] font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full uppercase border border-amber-100"><Clock size={10}/> Pending</span>}
                      {req.status === 'approved' && <span className="flex items-center gap-1 text-[9px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full uppercase border border-emerald-100"><CheckCircle size={10}/> Live</span>}
                      {req.status === 'rejected' && <span className="flex items-center gap-1 text-[9px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full uppercase border border-rose-100"><XCircle size={10}/> Rejected</span>}
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{req.badge} • Requested on {new Date(req.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="pr-4">
                     {req.status === 'approved' ? (
                       <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
                          <CheckCircle size={20} />
                       </div>
                     ) : (
                       <div className="text-right">
                          <p className="text-[9px] font-black text-slate-300 uppercase">Awaiting</p>
                          <p className="text-[9px] font-black text-slate-300 uppercase leading-none">Review</p>
                       </div>
                     )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VendorBannerRequest;