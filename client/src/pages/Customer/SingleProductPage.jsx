import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ShoppingBasket, ArrowLeft, Star, Truck, ShieldCheck, Loader2, Tag, User } from 'lucide-react';

const SingleProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`http://localhost:3000/product/${id}`);
        if (data.success) {
          setProduct(data.product);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Product not found!");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f9f4]">
      <Loader2 className="animate-spin text-[#1b4332]" size={48} />
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0f9f4] text-[#1b4332]">
      <h2 className="text-2xl font-bold mb-4">{error || "Product not found!"}</h2>
      <button onClick={() => navigate('/products')} className="font-bold underline">Return to Shop</button>
    </div>
  );

  const vendorName = product.user?.fullName || "Verified Vendor";
  const vendorId = product.user?._id || product.user;

  return (
    <div className="min-h-screen bg-[#f0f9f4] pb-12">
      {/* --- FIXED TOP NAVIGATION --- */}
      <div className="bg-[#1b4332] p-6 pt-12 pb-16"> {/* Increased pb-16 to give the button more room */}
        <div className="max-w-7xl mx-auto relative z-10"> {/* Added z-10 to stay above the card */}
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-white hover:text-[#ffb703] transition-colors font-black tracking-widest text-sm"
          >
            <ArrowLeft size={20} strokeWidth={3} /> BACK TO SHOP
          </button>
        </div>
      </div>

      {/* --- MAIN CARD --- */}
      <div className="max-w-7xl mx-auto px-6 -mt-10"> {/* Adjusted margin to -mt-10 for a cleaner overlap */}
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-[#d8f3dc]">
          <div className="flex flex-col md:flex-row">
            
            {/* Image Section */}
            <div className="md:w-1/2 p-8">
              <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-inner bg-[#f8fdfa]">
                <img 
                  src={product.images?.[0]?.url || 'https://via.placeholder.com/400'} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
                {product.isFestivalOffer && (
                  <div className="absolute top-6 left-6 bg-[#ffb703] text-[#1b4332] font-black px-5 py-2 rounded-full text-sm shadow-lg flex items-center gap-2">
                    <Tag size={16} /> {product.discountPercentage}% FESTIVAL OFFER
                  </div>
                )}
              </div>
            </div>

            {/* Details Section */}
            <div className="md:w-1/2 p-10 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[#40916c] font-black uppercase tracking-widest text-sm">
                  {product.category}
                </p>
                
                <Link 
                  to={`/vendor/profile/${vendorId}`}
                  className="flex items-center gap-2 bg-[#1b4332] px-4 py-2 rounded-full shadow-lg hover:bg-[#2d6a4f] transition-all hover:scale-105"
                >
                  <User size={14} className="text-[#ffb703]" />
                  <span className="text-[11px] font-black text-white uppercase tracking-tighter">
                    Seller: {vendorName}
                  </span>
                </Link>
              </div>

              <h1 className="text-4xl font-black text-[#1b4332] mb-4 uppercase tracking-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-2 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="fill-[#ffb703] text-[#ffb703]" />
                ))}
                <span className="text-gray-400 font-bold ml-2">(4.8 Rating)</span>
              </div>

              <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                {product.description || "Premium quality farm-fresh produce, grown with care."}
              </p>

              {/* Pricing Section */}
              <div className="flex items-center gap-6 mb-8">
                <div>
                  {product.isFestivalOffer ? (
                    <div className="flex flex-col">
                      <span className="text-gray-400 font-bold line-through text-lg">Rs. {product.price}</span>
                      <p className="text-5xl font-black text-[#1b4332]">Rs. {product.discountPrice}</p>
                    </div>
                  ) : (
                    <p className="text-5xl font-black text-[#1b4332]">Rs. {product.price}</p>
                  )}
                </div>
                
                <div className="h-12 w-[2px] bg-gray-100 mx-2"></div>

                <div className="flex flex-col">
                  <p className="text-[#40916c] text-sm font-black uppercase">Availability</p>
                  <p className="text-gray-400 text-xs font-bold">In Stock ({product.unit || '1kg'})</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 bg-[#1b4332] hover:bg-[#2d6a4f] text-white py-5 rounded-2xl font-black text-xl transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95">
                  <ShoppingBasket size={24} /> ADD TO BASKET
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-10 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="p-2 bg-[#f0f9f4] rounded-lg"><Truck className="text-[#40916c]" size={20} /></div>
                  <span className="text-sm font-bold">Fast Delivery</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="p-2 bg-[#f0f9f4] rounded-lg"><ShieldCheck className="text-[#40916c]" size={20} /></div>
                  <span className="text-sm font-bold">100% Organic</span>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-50 flex justify-end items-center gap-2">
                <p className="text-xs text-gray-400 font-medium italic">Fulfilled by: </p>
                <Link 
                  to={`/vendor/profile/${vendorId}`} 
                  className="text-[#40916c] font-black text-xs uppercase hover:text-[#1b4332] transition-colors"
                >
                  {vendorName}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleProductPage;