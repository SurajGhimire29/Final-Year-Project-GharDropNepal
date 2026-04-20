import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  User, 
  MapPin, 
  Calendar, 
  ArrowLeft, 
  Loader2, 
  Store, 
  Mail, 
  ShoppingBag, 
  ExternalLink,
  Camera 
} from "lucide-react";

const VendorProfile = () => {
  const { id: urlId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const storedUserId = localStorage.getItem("userId");
  // If urlId exists, we are viewing someone's profile. If not, we are viewing our own.
  const activeId = urlId || storedUserId;

  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (activeId) {
      fetchVendorData();
    } else {
      setLoading(false);
    }
  }, [activeId]);

  const fetchVendorData = async () => {
    try {
      setLoading(true);

      // 1. Fetch User details directly to get storeImage/storeName
      const userRes = await axios.get(`http://localhost:3000/user/${activeId}`);
      if (userRes.data.success) {
          setVendor(userRes.data.user);
      }

      // 2. Fetch Products and filter for this vendor
      const productRes = await axios.get("http://localhost:3000/products");
      const allProducts = productRes.data.products || [];
      
      const vendorProducts = allProducts.filter(p => {
          const productVendorId = p.user?._id || p.user; 
          return productVendorId === activeId;
      });

      setProducts(vendorProducts);

    } catch (err) {
      console.error("Error loading vendor profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = () => {
    // Only allow upload if viewing OWN profile (no urlId)
    if (!urlId && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    // Key matches the backend field name we set in authRouter
    formData.append("storeImage", file);

    try {
      setUploading(true);
      const res = await axios.put(`http://localhost:3000/user/update-avatar`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });

      if (res.data?.success) {
        // Update local state with the new image returned from server
        // We check if backend returned 'avatar' or 'storeImage'
        const newImage = res.data.avatar || res.data.storeImage;
        setVendor(prev => ({
          ...prev,
          storeImage: newImage 
        }));
        alert("Store image updated successfully!");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to update store image. Check console for details.");
    } finally {
      setUploading(false);
      e.target.value = null; // Reset input
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0f9f4]">
      <Loader2 className="animate-spin text-[#1b4332]" size={60} />
      <p className="font-black text-[#1b4332] mt-6 uppercase tracking-widest text-xs">Syncing Storefront...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0f9f4] pb-20 font-sans">
      {/* Hero Banner */}
      <div className="h-64 bg-[#081c15] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#40916c_1px,transparent_1px)] [background-size:20px_20px]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-10 relative z-10">
          <button 
            onClick={() => navigate(-1)} 
            className="group flex items-center gap-3 text-white/80 hover:text-[#ffb703] transition-colors font-black uppercase text-xs tracking-widest"
          >
            <div className="bg-white/10 p-2 rounded-full group-hover:bg-[#ffb703]/20">
                <ArrowLeft size={18} />
            </div>
            Back
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Profile Card */}
        <div className="bg-white rounded-[3rem] shadow-2xl -mt-24 p-8 md:p-12 border border-[#d8f3dc] relative overflow-hidden">
          <div className="flex flex-col md:flex-row gap-10 items-center md:items-start relative z-10">
            
            {/* STORE IMAGE SECTION */}
            <div className="relative group/avatar">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
              
              <div 
                onClick={handleImageClick}
                className={`w-44 h-44 rounded-[2.5rem] bg-[#ffb703] flex items-center justify-center text-[#1b4332] shadow-2xl border-[8px] border-white shrink-0 overflow-hidden rotate-3 relative transition-all duration-500 ${!urlId ? 'cursor-pointer hover:rotate-0' : ''}`}
              >
                {uploading && (
                  <div className="absolute inset-0 z-30 bg-black/40 flex items-center justify-center">
                    <Loader2 className="animate-spin text-white" size={32} />
                  </div>
                )}
                
                {!urlId && !uploading && (
                  <div className="absolute inset-0 z-20 bg-[#1b4332]/60 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center text-[#ffb703] transition-opacity">
                    <Camera size={30} />
                    <span className="text-[8px] font-black uppercase mt-1 text-center">Change<br/>Store Photo</span>
                  </div>
                )}

                {/* FALLBACK LOGIC: Checks storeImage first, then avatar */}
                {(vendor?.storeImage?.url || vendor?.avatar?.url) ? (
                  <img 
                    src={vendor.storeImage?.url || vendor.avatar?.url} 
                    alt={vendor?.storeName || "Vendor"} 
                    className="w-full h-full object-cover -rotate-3 group-hover/avatar:rotate-0 transition-transform duration-500" 
                  />
                ) : (
                  <Store size={80} className="-rotate-3" />
                )}
              </div>
            </div>

            {/* Vendor Details */}
            <div className="flex-grow text-center md:text-left pt-4">
              <div className="inline-block px-4 py-1 rounded-full bg-[#d8f3dc] text-[#1b4332] text-[10px] font-black uppercase tracking-tighter mb-3">
                Verified GharDrop Partner
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black text-[#1b4332] uppercase italic tracking-tighter leading-none">
                {vendor?.storeName || vendor?.fullName || "Local Store"}
              </h1>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-6 text-[#40916c] font-black text-[11px] uppercase tracking-widest">
                <div className="flex items-center gap-2 bg-[#f0f9f4] px-3 py-2 rounded-xl">
                    <Mail size={16} className="text-[#ffb703]" /> {vendor?.email || "N/A"}
                </div>
                <div className="flex items-center gap-2 bg-[#f0f9f4] px-3 py-2 rounded-xl">
                    <MapPin size={16} className="text-[#ffb703]" /> {vendor?.storeAddress || "Kathmandu, Nepal"}
                </div>
                <div className="flex items-center gap-2 bg-[#f0f9f4] px-3 py-2 rounded-xl">
                    <Calendar size={16} className="text-[#ffb703]" /> Joined 2026
                </div>
              </div>
            </div>

            {!urlId && (
                <div className="hidden lg:block">
                    <button className="bg-[#1b4332] text-[#ffb703] px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:scale-105 transition-transform">
                        Edit Profile <ExternalLink size={16} />
                    </button>
                </div>
            )}
          </div>
        </div>

        {/* INVENTORY SECTION */}
        <div className="mt-20 px-2">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-[#1b4332] uppercase italic tracking-tighter">
              Store <span className="text-[#40916c]">Listings</span> 
              <span className="ml-4 text-sm not-italic font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full tracking-normal capitalize">
                {products.length} Products
              </span>
            </h2>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {products.map((product) => (
                <div 
                  key={product._id} 
                  className="group bg-white rounded-[2.5rem] p-5 border border-[#e8f5e9] hover:border-[#ffb703] hover:shadow-2xl transition-all duration-500 cursor-pointer relative overflow-hidden"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <div className="h-56 bg-[#f8fdfa] rounded-[2rem] flex items-center justify-center mb-6 p-6 group-hover:scale-95 transition-transform duration-500">
                    <img 
                        src={product.images?.[0]?.url || "/placeholder.png"} 
                        alt={product.name} 
                        className="max-h-full object-contain drop-shadow-2xl" 
                    />
                  </div>

                  <div className="px-2">
                    <h3 className="text-[#1b4332] font-black text-xl uppercase truncate tracking-tighter group-hover:text-[#40916c] transition-colors">
                        {product.name}
                    </h3>
                    <div className="flex items-center justify-between mt-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Pricing</span>
                            <span className="font-black text-2xl text-[#1b4332]">
                                Rs. {product.price}
                            </span>
                        </div>
                        <div className="bg-[#1b4332] p-3 rounded-2xl text-[#ffb703] opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                            <ShoppingBag size={20} />
                        </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[4rem] py-32 text-center border-4 border-dashed border-[#d8f3dc]">
              <div className="bg-[#f0f9f4] w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Store size={48} className="text-[#40916c]" />
              </div>
              <h3 className="text-[#1b4332] font-black text-2xl uppercase italic tracking-tighter">Inventory Empty</h3>
              <p className="text-gray-400 font-bold uppercase text-[10px] mt-2 tracking-widest">No products posted yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;