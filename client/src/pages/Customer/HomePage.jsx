import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBasket, ArrowRight, Loader2, ChevronLeft, ChevronRight, Truck, ShieldCheck, Leaf, Sparkles, CheckCircle2, X, Star } from 'lucide-react';
import axios from 'axios';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [toast, setToast] = useState({ show: false, message: "" });
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [bannerRes, productRes] = await Promise.all([
          axios.get('http://localhost:3000/banners'),
          axios.get('http://localhost:3000/products')
        ]);

        if (bannerRes.data.success) {
          setBanners(bannerRes.data.banners.length > 0 ? bannerRes.data.banners : [
            {
              badge: "Welcome to GharDrop",
              title: "Freshness Delivered to Your Door",
              desc: "The ultimate destination for organic groceries and local Nepali products.",
              image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1920",
              vendor: null
            }
          ]);
        }
        if (productRes.data.success) setProducts(productRes.data.products);
      } catch (error) {
        console.error("Error loading homepage data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  // --- RATING HELPER ---
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
      navigate('/signin');
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

  const curatedPicks = products
    .filter(p => p.isFeatured || p.discountPercentage > 5)
    .sort((a, b) => b.discountPercentage - a.discountPercentage)
    .slice(0, 4);

  const latestArrivals = [...products]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  useEffect(() => {
    if (banners.length <= 1) return;
    const slideInterval = setInterval(() => {
      handleNextSlide();
    }, 6000);
    return () => clearInterval(slideInterval);
  }, [banners.length, currentSlide]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleBannerClick = (slide) => {
    if (slide.vendor) {
      const discountMatch = slide.badge.match(/\d+/);
      const discountVal = discountMatch ? discountMatch[0] : 0;
      navigate(`/products?vendorId=${slide.vendor}&minDiscount=${discountVal}`);
    } else {
      navigate('/products');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f0f9f4] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#1b4332]" size={50} />
      <p className="font-black text-[#1b4332] uppercase tracking-widest text-sm text-center">Harvesting fresh data...</p>
    </div>
  );

  return (
    <div className="bg-[#f0f9f4] min-h-screen font-sans">
      
      {/* --- TOAST NOTIFICATION --- */}
      <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 transform ${toast.show ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0 pointer-events-none"}`}>
        <div className="bg-[#1b4332] text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3 border-2 border-[#40916c]">
          <CheckCircle2 className="text-[#ffb703]" size={20} />
          <span className="font-bold text-sm tracking-wide">{toast.message}</span>
          <button onClick={() => setToast({show: false})} className="ml-2 opacity-50 hover:opacity-100"><X size={16}/></button>
        </div>
      </div>

      {/* --- HERO SLIDER --- */}
      <section className="relative h-[550px] md:h-[700px] w-full overflow-hidden rounded-b-[4rem] md:rounded-b-[6rem] shadow-2xl bg-[#081c15]">
        {banners.map((slide, index) => (
          <div 
            key={index} 
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100 visible scale-100" : "opacity-0 invisible scale-110"
            }`}
          >
            <div className="absolute inset-0 bg-cover bg-center blur-2xl opacity-30" style={{ backgroundImage: `url(${slide.image})` }} />
            <div className="absolute inset-0 flex justify-center items-center">
                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover brightness-75" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent"></div>

            <div className="relative z-10 h-full max-w-7xl mx-auto flex items-center px-8 md:px-20">
              <div className={`md:w-3/5 space-y-6 transition-all duration-1000 delay-300 ${index === currentSlide ? "translate-x-0 opacity-100" : "-translate-x-20 opacity-0"}`}>
                <span className="inline-block bg-[#ffb703] text-[#1b4332] px-6 py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-[0.3em]">
                    {slide.badge}
                </span>
                <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.9] uppercase italic tracking-tighter">
                    {slide.title.split(' ').slice(0, -1).join(' ')} <span className="text-[#ffb703]">{slide.title.split(' ').pop()}</span>
                </h1>
                <p className="text-white/80 text-sm md:text-xl max-w-lg font-medium leading-relaxed">
                    {slide.desc}
                </p>
                <div className="pt-6">
                  <button 
                    onClick={() => handleBannerClick(slide)} 
                    className="bg-[#ffb703] text-[#1b4332] px-10 py-5 rounded-full font-black flex items-center gap-3 hover:bg-white transition-all uppercase text-xs tracking-widest shadow-2xl active:scale-95"
                  >
                    Start Shopping <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation */}
        {banners.length > 1 && (
          <div className="absolute bottom-12 right-8 md:right-24 z-30 flex items-center gap-6">
              <button onClick={handlePrevSlide} className="text-white/50 hover:text-[#ffb703] transition-colors"><ChevronLeft size={32} /></button>
              <div className="flex gap-2">
                {banners.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === currentSlide ? "w-12 bg-[#ffb703]" : "w-3 bg-white/20"}`} />
                ))}
              </div>
              <button onClick={handleNextSlide} className="text-white/50 hover:text-[#ffb703] transition-colors"><ChevronRight size={32} /></button>
          </div>
        )}
      </section>

      {/* --- WHY CHOOSE US --- */}
      <section className="max-w-7xl mx-auto -mt-16 relative z-40 px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
                { icon: <Leaf className="text-[#ffb703]" />, title: "100% Organic", desc: "Sourced directly from local Himalayan farms." },
                { icon: <Truck className="text-[#ffb703]" />, title: "Fast Delivery", desc: "Freshness delivered to your door in 60 mins." },
                { icon: <ShieldCheck className="text-[#ffb703]" />, title: "Secure Pay", desc: "Safe transactions via Khalti & FonePay." },
            ].map((feature, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-xl flex items-center gap-6 border border-[#e8f5e9]">
                    <div className="bg-[#1b4332] p-4 rounded-2xl">{feature.icon}</div>
                    <div>
                        <h4 className="font-black text-[#1b4332] uppercase text-sm">{feature.title}</h4>
                        <p className="text-gray-500 text-xs font-medium">{feature.desc}</p>
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* --- OFFER PRODUCTS (CURATED) --- */}
      <section className="max-w-7xl mx-auto py-24 px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
                <span className="text-[#40916c] font-black uppercase tracking-[0.4em] text-[10px]">Special Deals</span>
                <h2 className="text-5xl md:text-7xl font-black text-[#1b4332] uppercase italic tracking-tighter mt-2">Offer <span className="text-[#ffb703]">Products</span></h2>
            </div>
            <Link to="/products" className="group flex items-center gap-3 bg-white px-8 py-4 rounded-full shadow-md hover:shadow-xl transition-all border border-[#d8f3dc]">
                <span className="font-black text-[#1b4332] uppercase text-xs tracking-widest">View All</span>
                <ArrowRight size={18} className="text-[#40916c] group-hover:translate-x-2 transition-transform" />
            </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {curatedPicks.length > 0 ? curatedPicks.map((product) => (
            <div key={product._id} className="group bg-white rounded-[3rem] p-4 border border-[#e8f5e9] hover:shadow-2xl transition-all duration-500">
              <div className="relative h-64 w-full bg-[#f8fdfa] rounded-[2.5rem] flex items-center justify-center p-6 mb-4 overflow-hidden">
                <Link to={`/product/${product._id}`} className="w-full h-full flex items-center justify-center">
                    <img src={product.images[0]?.url} alt={product.name} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-700" />
                </Link>
                {/* --- RATING BADGE --- */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
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
                <h3 className="text-[#1b4332] font-black text-lg uppercase truncate tracking-tight">{product.name}</h3>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex flex-col">
                    <span className="font-black text-xl text-[#1b4332]">Rs.{product.discountPrice || product.price}</span>
                    {product.discountPercentage > 0 && <span className="text-[10px] line-through text-gray-400 font-bold">Rs.{product.price}</span>}
                  </div>
                  <button 
                    disabled={cartLoading === product._id}
                    onClick={() => handleAddToCart(product)} 
                    className="bg-[#ffb703] text-[#1b4332] p-3 rounded-2xl hover:bg-[#1b4332] hover:text-white transition-all shadow-lg active:scale-90 flex items-center justify-center"
                  >
                    {cartLoading === product._id ? <Loader2 size={18} className="animate-spin" /> : <ShoppingBasket size={18} />}
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center py-20 bg-white rounded-[4rem] border-2 border-dashed border-[#d8f3dc]">
                <p className="text-[#1b4332] font-black uppercase tracking-widest">No offers available...</p>
            </div>
          )}
        </div>
      </section>

      {/* --- LATEST ARRIVALS --- */}
      <section className="bg-[#1b4332] py-24 rounded-t-[4rem] md:rounded-t-[6rem]">
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                <div>
                    <span className="text-[#ffb703] font-black uppercase tracking-[0.4em] text-[10px] flex items-center gap-2">
                        <Sparkles size={14} /> Just Landed
                    </span>
                    <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter mt-2">Latest <span className="text-[#ffb703]">Arrivals</span></h2>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {latestArrivals.map((product) => (
                    <div key={product._id} className="group bg-white/5 backdrop-blur-sm p-3 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-all duration-500">
                        <div className="relative h-48 w-full bg-white rounded-[2rem] flex items-center justify-center p-4 mb-4">
                            <Link to={`/product/${product._id}`}>
                                <img src={product.images[0]?.url} alt={product.name} className="max-h-full max-w-full object-contain group-hover:rotate-6 transition-transform duration-500" />
                            </Link>
                            {/* --- RATING BADGE LATEST --- */}
                            <div className="absolute top-3 left-3 bg-[#1b4332]/80 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/10">
                              <Star size={8} className="fill-[#ffb703] text-[#ffb703]" />
                              <span className="text-[9px] font-black text-white">{calculateAverage(product.reviews)}</span>
                            </div>
                        </div>
                        <div className="px-2 pb-2">
                            <h3 className="text-white font-black text-sm uppercase truncate mb-2">{product.name}</h3>
                            <div className="flex items-center justify-between">
                                <span className="text-[#ffb703] font-black text-base">Rs.{product.discountPrice || product.price}</span>
                                <button 
                                    disabled={cartLoading === product._id}
                                    onClick={() => handleAddToCart(product)}
                                    className="bg-white/10 hover:bg-[#ffb703] text-white hover:text-[#1b4332] p-2 rounded-xl transition-all flex items-center justify-center min-w-[32px]"
                                >
                                    {cartLoading === product._id ? <Loader2 size={16} className="animate-spin" /> : <ShoppingBasket size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>
    </div>
  );
};

export default Home;