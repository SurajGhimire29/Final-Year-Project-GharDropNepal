import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBasket, Search, Filter, Loader2, X, 
  ChevronRight, CheckCircle2, Star 
} from 'lucide-react';
import axios from 'axios';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cartLoading, setCartLoading] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "" });
  
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const vendorFilter = queryParams.get('vendorId');

  const categories = ["All", "Vegetables", "Fruits", "Dairy", "Organic", "Meat", "Bakery", "Staples", "Beverages", "Snacks", "Frozen"];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/products?t=${new Date().getTime()}`); 
        if (response.data.success) {
          setProducts(response.data.products);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [location.search]);

  const calculateAverage = (reviews) => {
    if (!reviews || reviews.length === 0) return "0.0";
    const total = reviews.reduce((acc, rev) => acc + Number(rev.rating), 0);
    return (total / reviews.length).toFixed(1);
  };

  const showToast = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  const handleAddToCart = async (product) => {
    const isAuthenticated = localStorage.getItem("userRole");
    if (!isAuthenticated) {
      showToast("Please login first!");
      navigate('/signin', { state: { from: location.pathname } });
      return;
    }
    try {
      setCartLoading(product._id); 
      const { data } = await axios.post("http://localhost:3000/addCart", 
        { productId: product._id, quantity: 1 }, 
        { withCredentials: true }
      );
      if (data.success) showToast(`${product.name} added to basket!`);
    } catch (err) {
      showToast("Error adding to cart");
    } finally {
      setCartLoading(null); 
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const productVendorId = product.user?._id || product.user; 
    return matchesSearch && matchesCategory && (vendorFilter ? String(productVendorId) === String(vendorFilter) : true);
  });

  if (loading) return (
    <div className="min-h-screen bg-[#f0f9f4] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#1b4332]" size={50} />
      <p className="font-black text-[#1b4332] uppercase tracking-widest text-sm text-center">Harvesting fresh data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0f9f4] pb-20 font-sans text-[#1b4332]">
      
      {/* --- TOAST --- */}
      <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 transform ${toast.show ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0 pointer-events-none"}`}>
        <div className="bg-[#1b4332] text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3 border-2 border-[#40916c]">
          <CheckCircle2 className="text-[#ffb703]" size={20} />
          <span className="font-bold text-sm tracking-wide">{toast.message}</span>
          <button onClick={() => setToast({show: false})} className="ml-2 opacity-50 hover:opacity-100"><X size={16}/></button>
        </div>
      </div>

      {/* --- HERO SECTION (MATCHING HOME PAGE) --- */}
      <div className="bg-[#1b4332] pt-24 pb-40 px-6 rounded-b-[4rem] md:rounded-b-[6rem] relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <span className="inline-block bg-[#ffb703] text-[#1b4332] px-6 py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mb-6">
            Explore the Collection
          </span>
          <h1 className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9] uppercase italic">
            {vendorFilter ? "Vendor " : "Our "} <span className="text-[#ffb703] not-italic">Marketplace</span>
          </h1>
          
          <div className="relative max-w-2xl mx-auto">
            <div className="relative flex items-center bg-white rounded-full p-1 shadow-2xl overflow-hidden">
              <div className="pl-6 pr-3 text-[#1b4332]"><Search size={22} /></div>
              <input 
                  type="text" 
                  placeholder="Search organic products..." 
                  className="w-full py-5 bg-transparent outline-none text-lg font-bold placeholder:text-gray-300" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* SIDEBAR */}
          <aside className="lg:w-1/4">
            <div className="sticky top-24 bg-white p-4 rounded-[3rem] shadow-xl border border-[#e8f5e9]">
              <div className="p-6 pb-4 border-b border-gray-100 mb-4">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Filter size={16} className="text-[#ffb703]" /> Categories
                </h2>
              </div>
              
              <div className="space-y-1 overflow-y-auto max-h-[50vh] custom-scrollbar px-2">
                {categories.map((cat) => (
                  <button 
                    key={cat} 
                    onClick={() => setSelectedCategory(cat)} 
                    className={`w-full group flex items-center justify-between px-6 py-4 rounded-2xl font-black transition-all duration-300 uppercase text-[11px] tracking-widest ${
                      selectedCategory === cat 
                      ? "bg-[#1b4332] text-white shadow-lg translate-x-2" 
                      : "text-[#1b4332]/60 hover:bg-[#f0f9f4] hover:text-[#1b4332]"
                    }`}
                  >
                    <span>{cat}</span>
                    <ChevronRight size={14} className={`${selectedCategory === cat ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* PRODUCT GRID */}
          <div className="lg:w-3/4">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <div key={product._id} className="group bg-white rounded-[3rem] p-4 border border-[#e8f5e9] hover:shadow-2xl transition-all duration-500">
                    <div className="relative h-64 w-full bg-[#f8fdfa] rounded-[2.5rem] flex items-center justify-center p-6 mb-4 overflow-hidden">
                      <Link to={`/product/${product._id}`} className="w-full h-full flex items-center justify-center">
                        <img src={product.images?.[0]?.url} alt={product.name} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-700" />
                      </Link>
                      
                      {/* RATING BADGE */}
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm flex items-center gap-1 border border-gray-100">
                        <Star size={10} className="fill-[#ffb703] text-[#ffb703]" />
                        <span className="text-[10px] font-black text-[#1b4332]">{calculateAverage(product.reviews)}</span>
                      </div>

                      {product.discountPercentage > 0 && (
                        <div className="absolute top-4 right-4 bg-[#1b4332] text-[#ffb703] px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-lg">
                          -{product.discountPercentage}%
                        </div>
                      )}
                    </div>

                    <div className="px-2 pb-2">
                      <span className="text-[10px] font-black text-[#40916c] uppercase tracking-widest">{product.category}</span>
                      <h3 className="text-[#1b4332] font-black text-lg uppercase truncate tracking-tight mb-4">{product.name}</h3>
                      
                      <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                        <div className="flex flex-col">
                          <span className="font-black text-xl text-[#1b4332]">Rs.{product.discountPrice || product.price}</span>
                          {product.discountPrice && <span className="text-[10px] line-through text-gray-400 font-bold">Rs.{product.price}</span>}
                        </div>
                        
                        <button 
                            disabled={cartLoading === product._id} 
                            onClick={() => handleAddToCart(product)} 
                            className="bg-[#ffb703] text-[#1b4332] p-4 rounded-2xl hover:bg-[#1b4332] hover:text-white transition-all shadow-lg active:scale-90 flex items-center justify-center"
                        >
                          {cartLoading === product._id ? <Loader2 className="animate-spin" size={20} /> : <ShoppingBasket size={20} />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-40 bg-white rounded-[4rem] border-2 border-dashed border-[#d8f3dc]">
                <Search size={48} className="mx-auto text-[#1b4332] mb-4 opacity-20" />
                <h3 className="text-[#1b4332] text-2xl font-black uppercase tracking-tighter">No items found</h3>
                <button onClick={() => {setSearchTerm(""); setSelectedCategory("All");}} className="mt-6 text-[#40916c] font-black underline uppercase text-xs tracking-widest">Reset Filters</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}} />
    </div>
  );
};

export default ProductsPage;