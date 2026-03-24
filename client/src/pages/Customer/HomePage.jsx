import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBasket, ArrowRight, Star, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

// Import your high-quality banner images here
// import banner1 from "../assets/banner1.jpg";
// import banner2 from "../assets/banner2.jpg";

const Home = ({ user }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const slides = [
    {
      badge: "Dashain Special Offer",
      title: "Get 20% OFF on All Organic Items",
      desc: "Celebrate the festivities with healthy choices. Fast delivery straight to your ghar.",
      // Replace these URLs with your local imports like {banner1}
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1920", 
    },
    {
      badge: "Fresh From Farm",
      title: "Pure Himalayan Honey & Herbs",
      desc: "Authentic local products sourced directly from the mountains to your doorstep.",
      image: "https://images.unsplash.com/photo-1505075119300-8dc0436d4a52?auto=format&fit=crop&q=80&w=1920",
    },
    {
      badge: "Fast Delivery",
      title: "Groceries to your Door in 30 Mins",
      desc: "Join the GharDrop family today and enjoy hassle-free grocery shopping across Nepal.",
      image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&q=80&w=1920",
    }
  ];

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);

    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('http://localhost:3000/products'); 
        if (data.success) setProducts(data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    return () => clearInterval(slideInterval);
  }, [slides.length]);

  // ... handleAddToCart function remains the same ...
  const handleAddToCart = async (product) => {
    const isAuthenticated = localStorage.getItem("userRole");
    if (!isAuthenticated) {
      alert("Please login first!");
      navigate('/signin', { state: { from: location.pathname } });
      return;
    }
    try {
      setCartLoading(product._id);
      const { data } = await axios.post("http://localhost:3000/addCart", { productId: product._id, quantity: 1 }, { withCredentials: true });
      if (data.success) alert(`${product.name} added!`);
    } catch (err) {
      console.error(err);
    } finally {
      setCartLoading(null);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#f0f9f4] flex items-center justify-center"><Loader2 className="animate-spin text-[#1b4332]" size={40} /></div>;

  return (
    <div className="bg-[#f0f9f4] min-h-screen">
      
      {/* --- FULL-WIDTH BACKGROUND IMAGE SLIDER --- */}
      <section className="relative h-[500px] md:h-[650px] w-full overflow-hidden rounded-b-[4rem] shadow-2xl bg-black">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100 scale-105" : "opacity-0 scale-100"
            }`}
          >
            {/* The Actual Background Image */}
            <img 
              src={slide.image} 
              alt={slide.title} 
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* DARK GRADIENT OVERLAY (Crucial for text readability) */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>

            {/* Content Container */}
            <div className="relative z-10 h-full max-w-7xl mx-auto flex items-center px-10 md:px-20">
              <div className="md:w-2/3 space-y-6">
                <span className="inline-block bg-[#ffb703] text-[#1b4332] px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest animate-bounce">
                  {slide.badge}
                </span>
                <h1 className="text-4xl md:text-7xl font-black text-white leading-tight drop-shadow-lg">
                  {slide.title}
                </h1>
                <p className="text-gray-100 text-lg opacity-90 max-w-lg drop-shadow-md">
                  {slide.desc}
                </p>
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => navigate('/products')}
                    className="bg-[#ffb703] text-[#1b4332] px-10 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-white transition-all hover:scale-105 shadow-xl uppercase text-sm tracking-wider"
                  >
                    Shop the Market <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button onClick={() => setCurrentSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1)} className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-4 rounded-2xl bg-black/20 hover:bg-[#ffb703] hover:text-[#1b4332] text-white backdrop-blur-md transition-all border border-white/10"><ChevronLeft size={28} /></button>
        <button onClick={() => setCurrentSlide(currentSlide === slides.length - 1 ? 0 : currentSlide + 1)} className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-4 rounded-2xl bg-black/20 hover:bg-[#ffb703] hover:text-[#1b4332] text-white backdrop-blur-md transition-all border border-white/10"><ChevronRight size={28} /></button>

        {/* Progress Indicators (Dots) */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-3">
          {slides.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setCurrentSlide(i)}
              className={`h-2.5 rounded-full transition-all duration-500 ${i === currentSlide ? "w-12 bg-[#ffb703]" : "w-3 bg-white/30 hover:bg-white/60"}`}
            />
          ))}
        </div>
      </section>

      {/* --- OUR FRESH PICKS SECTION (Unchanged) --- */}
      <section className="max-w-7xl mx-auto py-20 px-10">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-4xl font-black text-[#1b4332] uppercase tracking-tighter">Our Fresh Picks</h2>
            <div className="h-2 w-24 bg-[#ffb703] mt-3 rounded-full"></div>
          </div>
          <button onClick={() => navigate('/products')} className="text-[#1b4332] font-black flex items-center gap-2 hover:underline text-sm uppercase tracking-widest">View All Products <ArrowRight size={18} /></button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {products.map((product) => (
            <div key={product._id} className="group bg-white rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-[#d8f3dc]">
              <Link to={`/product/${product._id}`}>
                <div className="relative h-72 overflow-hidden">
                  <img src={product.images[0]?.url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <span className="absolute top-5 left-5 bg-[#1b4332] text-white text-[10px] font-black uppercase px-4 py-2 rounded-2xl shadow-lg">{product.category}</span>
                </div>
              </Link>
              <div className="p-8 text-center">
                <h3 className="text-[#1b4332] font-black text-xl mb-4 truncate uppercase">{product.name}</h3>
                <div className="flex items-center justify-between bg-[#f0f9f4] p-4 rounded-3xl">
                  <span className="text-xl font-black text-[#1b4332]">Rs. {product.price}</span>
                  <button onClick={() => handleAddToCart(product)} className="bg-[#1b4332] text-white p-3 rounded-2xl hover:bg-[#ffb703] hover:text-[#1b4332] transition-all shadow-md active:scale-90">
                    <ShoppingBasket size={22} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;