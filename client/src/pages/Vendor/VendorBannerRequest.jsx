import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  UploadCloud, 
  Loader2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Send, 
  ArrowLeft 
} from "lucide-react";
import { toast } from "react-hot-toast";

const VendorBannerRequest = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    badge: "",
    title: "",
    desc: "",
    shopName: ""
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

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
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return toast.error("Please upload a banner design");

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
        setImageFile(null);
        toast.success("Request sent! Waiting for Admin approval.");
      }
    } catch (err) {
      toast.error("Failed to send request. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* BACK BUTTON */}
        <button 
          onClick={() => navigate(-1)}
          className="group mb-8 flex items-center gap-2 text-[#1b4332] font-black uppercase text-xs tracking-widest hover:text-[#ffb703] transition-colors"
        >
          <div className="bg-white p-2 rounded-full shadow-sm group-hover:shadow-md group-hover:-translate-x-1 transition-all">
            <ArrowLeft size={18} />
          </div>
          Back to Dashboard
        </button>

        <div className="flex flex-col md:row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-[#1b4332] uppercase tracking-tighter italic">
              Banner <span className="text-[#ffb703]">Advertising</span>
            </h1>
            <p className="text-slate-500 font-medium">Request a premium promotion spot on the GharDrop homepage</p>
          </div>
          <div className="bg-white px-8 py-4 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Standard Promotion Fee</p>
            <p className="text-2xl font-black text-[#1b4332]">Rs. 500 <span className="text-[10px] text-emerald-500 font-black bg-emerald-50 px-2 py-1 rounded-lg ml-2">PAY ON APPROVAL</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: REQUEST FORM */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 sticky top-8">
              <h2 className="text-xl font-black text-[#1b4332] uppercase mb-1 flex items-center gap-2 italic">
                <Send size={20} className="text-[#ffb703]" /> New Slot Request
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-6 tracking-wide">Fee: Rs. 500 (Deducted from future sales)</p>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-[#40916c] ml-2 tracking-widest">Shop Identity</label>
                  <input 
                    type="text" placeholder="e.g. Kathmandu Organic Farm" 
                    className="w-full p-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#1b4332] transition-all font-bold text-sm outline-none"
                    value={formData.shopName} onChange={(e) => setFormData({...formData, shopName: e.target.value})} required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-[#40916c] ml-2 tracking-widest">Badge Text</label>
                    <input 
                      type="text" placeholder="20% OFF" 
                      className="w-full p-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#1b4332] font-bold text-sm outline-none"
                      value={formData.badge} onChange={(e) => setFormData({...formData, badge: e.target.value})} required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-[#40916c] ml-2 tracking-widest">Title</label>
                    <input 
                      type="text" placeholder="Fresh Apples" 
                      className="w-full p-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#1b4332] font-bold text-sm outline-none"
                      value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-[#40916c] ml-2 tracking-widest">Short Description</label>
                    <textarea 
                      placeholder="Tell customers why they should click..." 
                      className="w-full p-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#1b4332] font-bold text-sm h-24 resize-none outline-none"
                      value={formData.desc} onChange={(e) => setFormData({...formData, desc: e.target.value})} required
                    />
                </div>

                <div className="relative">
                  <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors overflow-hidden group">
                    {preview ? (
                      <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <UploadCloud className="text-[#ffb703] mx-auto mb-2 group-hover:scale-110 transition-transform" size={32} />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Banner Design (1920x600)</p>
                        <p className="text-[9px] text-slate-300 font-bold mt-1">PNG, JPG or WEBP preferred</p>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleFile} />
                  </label>
                </div>

                <button 
                  disabled={submitting}
                  className="w-full py-5 bg-[#1b4332] text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-[#ffb703] hover:text-[#1b4332] transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 active:scale-95"
                >
                  {submitting ? <Loader2 className="animate-spin" /> : "Submit for Approval"}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT: TRACKING STATUS */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-6 px-4">
                <h2 className="text-xs font-black text-[#1b4332] uppercase tracking-[0.2em]">Request History</h2>
                <div className="h-px bg-slate-200 flex-grow mx-4"></div>
                <span className="text-[10px] font-bold text-slate-400 italic">Latest Updates</span>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="animate-spin text-[#ffb703] mb-4" size={40} />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Records...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="bg-white p-12 rounded-[2.5rem] text-center border border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold">No advertising requests found yet.</p>
                </div>
              ) : (
                requests.map((req) => (
                  <div key={req._id} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 flex items-center gap-6 group hover:border-[#1b4332]/20 hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                    <div className="h-20 w-36 rounded-2xl overflow-hidden shadow-inner shrink-0 bg-slate-100 border border-slate-50">
                      <img src={req.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-black text-[#1b4332] uppercase text-sm truncate max-w-[180px] tracking-tight">{req.title}</h4>
                        {req.status === 'pending' && <span className="flex items-center gap-1 text-[9px] font-black text-amber-500 bg-amber-50 px-3 py-1 rounded-full uppercase border border-amber-100"><Clock size={10}/> In Review</span>}
                        {req.status === 'approved' && <span className="flex items-center gap-1 text-[9px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase border border-emerald-100"><CheckCircle size={10}/> Active</span>}
                        {req.status === 'rejected' && <span className="flex items-center gap-1 text-[9px] font-black text-rose-500 bg-rose-50 px-3 py-1 rounded-full uppercase border border-rose-100"><XCircle size={10}/> Declined</span>}
                      </div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">
                        <span className="text-[#ffb703]">{req.badge}</span> • Requested on {new Date(req.createdAt).toLocaleDateString('en-GB')}
                      </p>
                    </div>

                    <div className="pr-4 hidden sm:block">
                       {req.status === 'approved' ? (
                         <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shadow-inner group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                            <CheckCircle size={24} />
                         </div>
                       ) : req.status === 'rejected' ? (
                        <div className="h-12 w-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center shadow-inner">
                            <XCircle size={24} />
                         </div>
                       ) : (
                         <div className="text-right">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Awaiting</p>
                            <p className="text-[9px] font-black text-[#ffb703] uppercase leading-none">Admin</p>
                         </div>
                       )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VendorBannerRequest;