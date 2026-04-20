import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ShoppingBasket, ArrowLeft, Star, Tag, User, 
  CheckCircle2, MessageSquare, Send, Quote, Loader2 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const SingleProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(false);

  // --- REVIEW STATES ---
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // 1. Fetch Product Data
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

  useEffect(() => {
    fetchProduct();
  }, [id]);

  // --- UI HELPERS ---
  const calculateAverage = (reviews) => {
    if (!reviews || reviews.length === 0) return "0.0";
    const total = reviews.reduce((acc, rev) => acc + Number(rev.rating), 0);
    return (total / reviews.length).toFixed(1);
  };

  const getInitials = (name) => name ? name.split(" ").map(n => n[0]).join("").toUpperCase() : "U";

  // 2. Add to Cart Logic
  const handleAddToCart = async () => {
    const userRole = localStorage.getItem("userRole");
    if (!userRole) {
      toast.error("Please sign in to add items to your basket!");
      navigate("/signin");
      return;
    }
    try {
      setAdding(true);
      const response = await axios.post(
        "http://localhost:3000/cart/add", 
        { productId: product._id, quantity: 1 },
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success("Added to GharDrop Basket!");
        setSuccessMsg(true);
        setTimeout(() => setSuccessMsg(false), 3000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to basket");
    } finally {
      setAdding(false);
    }
  };

  // 3. Submit Review Logic
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingReview(true);
      const { data } = await axios.post(
        `http://localhost:3000/product/${id}/review`,
        { rating, comment },
        { withCredentials: true }
      );
      if (data.success) {
        setComment("");
        // Refresh product to show new review and updated average
        await fetchProduct();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

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

  const productAvg = calculateAverage(product.reviews);
  const totalReviews = product.reviews?.length || 0;
  const vendorName = product.user?.fullName || "Verified Vendor";
  const vendorId = product.user?._id || product.user;

  return (
    <div className="min-h-screen bg-[#f0f9f4] pb-20 text-left">
      {/* Header */}
      <div className="bg-[#1b4332] p-6 pt-12 pb-16">
        <div className="max-w-7xl mx-auto relative z-10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white hover:text-[#ffb703] transition-colors font-black tracking-widest text-sm">
            <ArrowLeft size={20} strokeWidth={3} /> BACK TO SHOP
          </button>
        </div>
      </div>

      {/* Main Product Card */}
      <div className="max-w-7xl mx-auto px-6 -mt-10">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-[#d8f3dc]">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 p-8">
              <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-inner bg-[#f8fdfa]">
                <img src={product.images?.[0]?.url || 'https://via.placeholder.com/400'} alt={product.name} className="w-full h-full object-cover" />
                {product.isFestivalOffer && (
                  <div className="absolute top-6 left-6 bg-[#ffb703] text-[#1b4332] font-black px-5 py-2 rounded-full text-sm shadow-lg flex items-center gap-2">
                    <Tag size={16} /> {product.discountPercentage}% FESTIVAL OFFER
                  </div>
                )}
              </div>
            </div>

            <div className="md:w-1/2 p-10 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[#40916c] font-black uppercase tracking-widest text-sm">{product.category}</p>
                <Link to={`/vendor/profile/${vendorId}`} className="flex items-center gap-2 bg-[#1b4332] px-4 py-2 rounded-full shadow-lg hover:bg-[#2d6a4f] transition-all hover:scale-105">
                  <User size={14} className="text-[#ffb703]" />
                  <span className="text-[11px] font-black text-white uppercase tracking-tighter">Seller: {vendorName}</span>
                </Link>
              </div>

              <h1 className="text-4xl font-black text-[#1b4332] mb-4 uppercase tracking-tight">{product.name}</h1>
              
              <div className="flex items-center gap-2 mb-6">
                <div className="flex bg-[#ffb703]/10 px-3 py-1 rounded-full items-center gap-1">
                  <Star size={16} className="fill-[#ffb703] text-[#ffb703]" />
                  <span className="text-[#1b4332] font-black">{productAvg}</span>
                </div>
                <span className="text-gray-400 font-bold ml-2">({totalReviews} Reviews)</span>
              </div>

              <p className="text-gray-600 leading-relaxed mb-8 text-lg">{product.description}</p>

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
              </div>

              <button 
                onClick={handleAddToCart}
                disabled={adding || successMsg || product.stock < 1}
                className={`w-full py-5 rounded-2xl font-black text-xl transition-all flex items-center justify-center gap-3 shadow-xl 
                  ${successMsg ? 'bg-green-600 text-white' : 'bg-[#1b4332] hover:bg-[#2d6a4f] text-white'} 
                  disabled:opacity-50`}
              >
                {adding ? <Loader2 className="animate-spin" /> : successMsg ? <><CheckCircle2 /> ADDED</> : <><ShoppingBasket /> ADD TO BASKET</>}
              </button>
            </div>
          </div>
        </div>

        {/* --- REVIEW UI --- */}
        <div className="mt-20">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <h2 className="text-4xl font-black text-[#1b4332] uppercase tracking-tighter">Community Feedback</h2>
              <p className="text-[#40916c] font-bold">Verified reviews from farm-fresh buyers</p>
            </div>
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-[#d8f3dc]">
               <div className="text-right">
                  <p className="text-xs font-black text-gray-400 uppercase">Average Rating</p>
                  <p className="text-2xl font-black text-[#1b4332]">{productAvg} / 5.0</p>
               </div>
               <div className="h-10 w-[1px] bg-gray-200"></div>
               <MessageSquare className="text-[#ffb703]" size={32} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Form */}
            <div className="lg:col-span-4">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-[#d8f3dc] sticky top-6">
                <h3 className="text-xl font-black text-[#1b4332] mb-6 flex items-center gap-2">
                  <Quote className="text-[#ffb703] rotate-180" size={20} /> SHARE YOUR EXPERIENCE
                </h3>
                <form onSubmit={handleReviewSubmit} className="space-y-5">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs font-black text-[#40916c] uppercase">Rating</label>
                      <span className="text-xs font-bold text-[#ffb703]">{rating} Stars</span>
                    </div>
                    <div className="flex gap-2 bg-[#f8fdfa] p-3 rounded-2xl border border-[#d8f3dc]">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button key={num} type="button" onClick={() => setRating(num)} className="transition-transform active:scale-90">
                          <Star size={24} className={`${rating >= num ? 'fill-[#ffb703] text-[#ffb703]' : 'text-gray-200'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-[#40916c] uppercase mb-2">Comment</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Was the quality fresh?"
                      className="w-full p-5 bg-[#f8fdfa] border border-[#d8f3dc] rounded-2xl focus:ring-2 focus:ring-[#40916c] outline-none min-h-[150px] font-medium text-sm"
                      required
                    />
                  </div>
                  <button type="submit" disabled={submittingReview} className="w-full bg-[#1b4332] text-white py-4 rounded-2xl font-black hover:bg-[#2d6a4f] transition-all flex items-center justify-center gap-2 shadow-lg">
                    {submittingReview ? <Loader2 className="animate-spin" /> : <><Send size={18} /> POST REVIEW</>}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Review Grid */}
            <div className="lg:col-span-8">
              {product.reviews && product.reviews.length > 0 ? (
                <div className="columns-1 md:columns-2 gap-6 space-y-6">
                  {product.reviews.map((rev, index) => (
                    <div key={index} className="break-inside-avoid bg-white p-6 rounded-[2rem] shadow-lg border border-gray-100 hover:border-[#40916c]/30 transition-all group">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 bg-[#1b4332] rounded-full flex items-center justify-center overflow-hidden shadow-md group-hover:scale-110 transition-transform">
                          {rev.user?.avatar?.url ? (
                            <img src={rev.user.avatar.url} alt={rev.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[#ffb703] font-black text-xs">{getInitials(rev.name)}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-black text-[#1b4332] text-sm uppercase leading-none">{rev.name}</h4>
                          <div className="flex mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={10} className={`${i < rev.rating ? "fill-[#ffb703] text-[#ffb703]" : "text-gray-100"}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="relative">
                        <Quote className="absolute -top-2 -left-2 text-[#f0f9f4] -z-0" size={40} />
                        <p className="text-gray-600 font-medium text-sm leading-relaxed relative z-10 italic">
                          "{rev.comment}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/50 border-4 border-dashed border-[#d8f3dc] rounded-[3rem] p-20 text-center">
                  <MessageSquare className="mx-auto text-[#d8f3dc] mb-4" size={64} />
                  <p className="text-gray-400 font-black uppercase tracking-widest">No feedback yet. Share your thoughts!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleProductPage;