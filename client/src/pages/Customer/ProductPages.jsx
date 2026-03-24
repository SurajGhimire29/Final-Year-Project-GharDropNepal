import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBasket, Search, Filter, Loader2, Tag } from 'lucide-react';
import axios from 'axios';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cartLoading, setCartLoading] = useState(null); 
  
  const navigate = useNavigate();
  const location = useLocation();
  const categories = ["All", "Vegetables", "Fruits", "Dairy", "Organic", "Meat", "Bakery", "Staples"];

  // --- API FETCHING ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:3000/products"); 
        if (response.data.success) {
          setProducts(response.data.products);
        }
      } catch (err) {
        setError("Failed to load products. Please try again later.");
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // --- UPDATED ADD TO CART LOGIC ---
  const handleAddToCart = async (product) => {
    // 1. Check if user is logged in via localStorage
    const isAuthenticated = localStorage.getItem("userRole");

    if (!isAuthenticated) {
      // Show alert and redirect to signin
      alert("Please login first to add items to your basket!");
      // We pass the current path so we can redirect back after login
      navigate('/signin', { state: { from: location.pathname } });
      return;
    }

    try {
      setCartLoading(product._id); 
      
      const { data } = await axios.post(
        "http://localhost:3000/addCart",
        {
          productId: product._id,
          quantity: 1, 
        },
        { withCredentials: true } 
      );

      if (data.success) {
        alert(`${product.name} added to your basket!`);
      }
    } catch (err) {
      console.error("Add to cart error:", err);
      
      // If server returns 401 (Unauthorized), clear local storage and redirect
      if (err.response?.status === 401) {
        localStorage.clear();
        alert("Session expired. Please login again.");
        navigate('/signin');
      } else {
        alert(err.response?.data?.message || "Something went wrong");
      }
    } finally {
      setCartLoading(null); 
    }
  };

  // --- FILTER LOGIC ---
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f9f4]">
        <Loader2 className="animate-spin text-[#1b4332]" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0f9f4] pb-20">
      {/* Hero Section */}
      <div className="bg-[#1b4332] pt-16 pb-24 px-10 rounded-b-[3rem]">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-8 uppercase tracking-tighter">
            Find Your <span className="text-[#ffb703]">Fresh Picks</span>
          </h1>
        
          <div className="relative max-w-2xl mx-auto flex items-center bg-white rounded-full p-2 shadow-2xl">
            <Search className="ml-4 text-gray-400" size={24} />
            <input 
              type="text" 
              placeholder="Search for organic vegetables, fruits..." 
              className="w-full p-3 outline-none rounded-full text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <aside className="lg:w-1/4 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#d8f3dc]">
              <div className="flex items-center gap-2 mb-4 text-[#1b4332] font-black uppercase tracking-wider">
                <Filter size={20} /> Categories
              </div>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all font-semibold ${
                      selectedCategory === cat 
                      ? "bg-[#1b4332] text-white shadow-md" 
                      : "text-gray-600 hover:bg-[#f0f9f4]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="lg:w-3/4">
            <div className="flex items-center justify-between mb-6 px-2">
              <p className="text-[#1b4332] font-bold">Showing {filteredProducts.length} results</p>
            </div>

            {error && <p className="text-red-500 mb-4 font-bold">{error}</p>}

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product._id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[#d8f3dc] flex flex-col">
                    
                    {/* Image Container */}
                    <Link to={`/product/${product._id}`} className="block overflow-hidden relative h-56">
                      <img 
                        src={product.images?.[0]?.url || 'https://via.placeholder.com/400'} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                      
                      {product.isFestivalOffer && (
                        <div className="absolute top-4 left-4 bg-[#ffb703] text-[#1b4332] font-black px-3 py-1 rounded-full text-[10px] uppercase shadow-lg flex items-center gap-1">
                          <Tag size={10} /> {product.discountPercentage}% OFF
                        </div>
                      )}
                    </Link>

                    {/* Content Section */}
                    <div className="p-6 flex flex-col flex-grow">
                      <p className="text-[#40916c] text-xs font-bold uppercase mb-1">{product.category}</p>
                      
                      <Link to={`/product/${product._id}`}>
                        <h3 className="text-[#1b4332] font-bold text-lg mb-2 hover:text-[#40916c] transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="flex items-end justify-between mt-auto">
                        <div className="flex flex-col">
                          {product.isFestivalOffer ? (
                            <>
                              <span className="text-gray-400 text-xs font-bold line-through">
                                Rs. {product.price}
                              </span>
                              <p className="text-xl font-black text-[#1b4332]">
                                Rs. {product.discountPrice}
                              </p>
                            </>
                          ) : (
                            <p className="text-xl font-black text-[#1b4332]">
                              Rs. {product.price}
                            </p>
                          )}
                        </div>

                        {/* Add to Cart Button */}
                        <button 
                          disabled={cartLoading === product._id}
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToCart(product);
                          }}
                          className={`bg-[#ffb703] text-[#1b4332] p-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center min-w-[44px] ${
                            cartLoading === product._id ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
                          }`}
                        >
                          {cartLoading === product._id ? (
                            <Loader2 className="animate-spin" size={22} />
                          ) : (
                            <ShoppingBasket size={22} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-[#40916c]">
                <p className="text-[#1b4332] text-xl font-bold">No products found</p>
                <button 
                  onClick={() => {setSearchTerm(""); setSelectedCategory("All");}} 
                  className="mt-4 text-[#40916c] underline font-semibold"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;