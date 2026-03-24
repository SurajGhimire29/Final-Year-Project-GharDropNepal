import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  ExternalLink,
  Loader2,
  ArrowLeft
} from "lucide-react";
// Assuming your Navbar component is imported here
// import Navbar from '../components/Navbar'; 

const VendorProduct = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchVendorProducts = async () => {
      try {
        setLoading(true);
        const userRes = await axios.get("http://localhost:3000/me", { withCredentials: true });
        const vendorId = userRes.data.user._id;

        const res = await axios.get("http://localhost:3000/products");
        if (res.data.success) {
          const myProducts = res.data.products.filter(p => (p.user?._id || p.user) === vendorId);
          setProducts(myProducts);
        }
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVendorProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f0f9f4]">
      {/* 1. If you have a global Navbar, it goes here */}
      {/* <Navbar /> */}

      <main className="max-w-7xl mx-auto p-6 md:p-12">
        
        {/* 2. BACK BUTTON SECTION */}
        <div className="mb-8">
          <button 
            onClick={() => navigate("/vendor-dashboard")} 
            className="flex items-center gap-2 text-[#1b4332] hover:text-[#40916c] transition-all font-black uppercase tracking-widest text-sm group"
          >
            <div className="bg-white p-2 rounded-xl shadow-sm group-hover:shadow-md transition-all">
              <ArrowLeft size={20} />
            </div>
            Back to Dashboard
          </button>
        </div>

        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-[#1b4332] p-2 rounded-lg text-[#ffb703]">
                <Package size={24} />
              </div>
              <span className="text-[#40916c] font-black uppercase tracking-[0.2em] text-xs">
                Inventory Management
              </span>
            </div>
            <h2 className="text-4xl font-black text-[#1b4332] uppercase tracking-tight">
              My Products
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#40916c]" size={18} />
              <input 
                type="text" 
                placeholder="Search inventory..."
                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-[#d8f3dc] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#40916c] font-bold text-[#1b4332]"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => navigate("/addproduct")}
              className="w-full sm:w-auto bg-[#1b4332] text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-[#2d6a4f] transition-all shadow-xl active:scale-95"
            >
              <Plus size={20} strokeWidth={3} /> NEW LISTING
            </button>
          </div>
        </header>

        {/* Grid and Content */}
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-[#1b4332]" size={48} />
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-[2.5rem] overflow-hidden border border-[#d8f3dc] shadow-sm hover:shadow-2xl transition-all group">
                <div className="relative h-56 bg-[#f8fdfa] overflow-hidden">
                  <img 
                    src={product.images?.[0]?.url || 'https://via.placeholder.com/400'} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button className="p-3 bg-white text-[#1b4332] rounded-2xl hover:bg-[#ffb703] transition-all shadow-lg">
                      <Edit3 size={18} />
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-6">
                    <span className="bg-[#ffb703] text-[#1b4332] text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                      {product.category}
                    </span>
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="font-black text-[#1b4332] text-xl uppercase truncate mb-2">
                    {product.name}
                  </h3>
                  
                  <div className="flex justify-between items-end mb-6">
                    <p className="text-3xl font-black text-[#1b4332]">Rs.{product.price}</p>
                    <span className="text-xs font-bold text-gray-400 bg-[#f0f9f4] px-3 py-1 rounded-lg">
                      {product.unit || '1kg'}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <Link 
                      to={`/product/${product._id}`}
                      className="flex-grow flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1b4332] text-white font-bold text-sm hover:bg-[#2d6a4f] transition-all"
                    >
                      <ExternalLink size={16} /> VIEW LIVE
                    </Link>
                    <button className="p-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[4rem] p-20 text-center border-2 border-dashed border-[#d8f3dc]">
             <Package size={48} className="mx-auto text-[#40916c] mb-4" />
             <h3 className="text-2xl font-black text-[#1b4332] uppercase">No Products Found</h3>
             <button 
              onClick={() => navigate("/addproduct")}
              className="mt-6 bg-[#1b4332] text-[#ffb703] px-10 py-5 rounded-[2rem] font-black hover:scale-105 transition-all shadow-2xl"
            >
              ADD PRODUCT
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default VendorProduct;