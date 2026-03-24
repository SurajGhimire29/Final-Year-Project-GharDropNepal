import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  User, 
  MapPin, 
  Calendar, 
  Package, 
  Star, 
  ArrowLeft, 
  Loader2, 
  Store,
  Mail
} from "lucide-react";

const VendorProfile = () => {
  const { id } = useParams(); // Get vendor ID from URL
  const navigate = useNavigate();
  
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        setLoading(true);
        // 1. Fetch all products and filter by this vendor ID
        const productRes = await axios.get("http://localhost:3000/products");
        const vendorProducts = productRes.data.products.filter(p => p.user?._id === id || p.user === id);
        setProducts(vendorProducts);

        // 2. Fetch Vendor details (assuming your /me logic or a public user route)
        // If you don't have a public user route, we can derive info from the first product
        if (vendorProducts.length > 0 && vendorProducts[0].user) {
            setVendor(vendorProducts[0].user);
        } else {
            // Fallback: Fetch specific user if endpoint exists
            const userRes = await axios.get(`http://localhost:3000/user/${id}`);
            setVendor(userRes.data.user);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f9f4]">
      <Loader2 className="animate-spin text-[#1b4332]" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0f9f4] pb-20">
      {/* Green Header Banner */}
      <div className="h-60 bg-[#1b4332] relative">
        <div className="max-w-7xl mx-auto px-6 pt-10">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-white/80 hover:text-white font-bold transition-all"
          >
            <ArrowLeft size={20} /> BACK
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Profile Info Card */}
        <div className="bg-white rounded-[3rem] shadow-xl -mt-24 p-8 md:p-12 border border-[#d8f3dc] relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Store size={200} className="text-[#1b4332]" />
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
            {/* Avatar Circle */}
            <div className="w-32 h-32 rounded-[2.5rem] bg-[#ffb703] flex items-center justify-center text-[#1b4332] shadow-lg border-4 border-white">
              <User size={60} strokeWidth={2.5} />
            </div>

            <div className="flex-grow">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-4xl font-black text-[#1b4332] uppercase tracking-tight">
                  {vendor?.fullName || "Vendor Name"}
                </h1>
                <span className="bg-[#40916c] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  Verified Vendor
                </span>
              </div>

              <div className="flex flex-wrap gap-6 text-gray-500 font-bold text-sm">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-[#40916c]" />
                  {vendor?.email || "No email provided"}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-[#40916c]" />
                  GharDrop Network
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-[#40916c]" />
                  Joined March 2026
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex gap-10 mt-8 pt-8 border-t border-gray-100">
                <div>
                  <p className="text-2xl font-black text-[#1b4332]">{products.length}</p>
                  <p className="text-xs font-bold text-[#40916c] uppercase">Products</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-[#1b4332]">4.9</p>
                  <p className="text-xs font-bold text-[#40916c] uppercase">Rating</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-[#1b4332]">100%</p>
                  <p className="text-xs font-bold text-[#40916c] uppercase">Response</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vendor's Collection */}
        <div className="mt-16">
          <div className="flex items-center gap-4 mb-8">
            <Package className="text-[#ffb703]" size={32} />
            <h2 className="text-2xl font-black text-[#1b4332] uppercase tracking-tight">
              Seller's Collection
            </h2>
            <div className="h-[2px] flex-grow bg-[#d8f3dc]"></div>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <div 
                  key={product._id} 
                  onClick={() => navigate(`/product/${product._id}`)}
                  className="bg-white rounded-[2rem] overflow-hidden shadow-md border border-[#d8f3dc] group cursor-pointer hover:shadow-xl transition-all"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={product.images[0]?.url || 'https://via.placeholder.com/300'} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] font-black text-[#40916c] uppercase mb-1">{product.category}</p>
                    <h3 className="font-black text-[#1b4332] mb-2 truncate">{product.name}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-black text-[#1b4332]">Rs. {product.price}</span>
                      <button className="p-2 bg-[#f0f9f4] text-[#1b4332] rounded-xl group-hover:bg-[#ffb703] transition-colors">
                        <Package size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] p-20 text-center border-2 border-dashed border-[#b7e4c7]">
              <Package size={48} className="mx-auto text-[#b7e4c7] mb-4" />
              <p className="text-[#1b4332] font-black text-xl">No active products</p>
              <p className="text-gray-400 font-medium">This vendor hasn't listed any items yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;