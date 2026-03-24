import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck,
  Zap,
  Loader2
} from 'lucide-react';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  // API Base URL - update this if you use an /api/v1 prefix
  const API_URL = 'http://localhost:3000';

  // 1. Fetch Cart Data
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/getCart`, { withCredentials: true });
      if (data.success) {
        setCart(data.cart);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // 2. Update Quantity
  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1 || actionLoading) return;
    try {
      setActionLoading(true);
      const { data } = await axios.put(`${API_URL}/updateCart`, 
        { productId, quantity: newQuantity }, 
        { withCredentials: true }
      );
      if (data.success) setCart(data.cart);
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Remove Item
  const handleRemoveItem = async (productId) => {
    if (actionLoading) return;
    try {
      setActionLoading(true);
      const { data } = await axios.delete(`${API_URL}/deleteCart/${productId}`, { withCredentials: true });
      if (data.success) setCart(data.cart);
    } catch (err) {
      console.error("Remove failed:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Clear Entire Cart
  const handleClearCart = async () => {
    if (!window.confirm("Empty your whole basket?") || actionLoading) return;
    try {
      setActionLoading(true);
      const { data } = await axios.delete(`${API_URL}/clearCart`, { withCredentials: true });
      if (data.success) setCart({ items: [], totalPrice: 0 });
    } catch (err) {
      console.error("Clear failed:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f0f9f4]">
        <Loader2 className="animate-spin text-[#1b4332]" size={48} />
      </div>
    );
  }

  // --- EMPTY STATE ---
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f0f9f4] flex flex-col items-center justify-center p-6">
        <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl text-center border border-[#d8f3dc] max-w-md w-full">
          <div className="bg-[#f0f9f4] w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={48} className="text-[#40916c]" />
          </div>
          <h2 className="text-3xl font-black text-[#1b4332] uppercase tracking-tight">Basket is Empty</h2>
          <p className="text-gray-500 my-6 font-medium leading-relaxed">
            Your organic haul is waiting! Start adding fresh farm products to your basket.
          </p>
          <Link 
            to="/products" 
            className="flex items-center justify-center gap-2 bg-[#1b4332] text-[#ffb703] w-full py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
          >
            <ArrowLeft size={20} /> Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  // --- MAIN UI ---
  return (
    <div className="min-h-screen bg-[#f0f9f4] pb-20">
      {/* Header */}
      <div className="bg-[#1b4332] pt-16 pb-24 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-2">
              Your <span className="text-[#ffb703]">Basket</span>
            </h1>
            <p className="text-[#40916c] font-black uppercase tracking-widest text-xs">
              {cart.items.length} Fresh items selected
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleClearCart}
              className="text-red-300 hover:text-red-500 font-bold uppercase text-[10px] tracking-widest transition-all"
            >
              Clear Basket
            </button>
            <button 
              onClick={() => navigate('/products')}
              className="flex items-center gap-2 text-white/80 hover:text-[#ffb703] font-bold uppercase text-xs tracking-widest transition-all"
            >
              <ArrowLeft size={16} /> Continue Shopping
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Item List */}
          <div className="lg:w-2/3 space-y-4">
            {cart.items.map((item) => (
              <div 
                key={item.product._id || item.product} 
                className={`bg-white p-6 rounded-[2.5rem] shadow-sm border border-[#d8f3dc] flex flex-col sm:flex-row items-center gap-6 group transition-all ${actionLoading ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="w-28 h-28 flex-shrink-0 rounded-3xl overflow-hidden bg-[#f8fdfa]">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-grow text-center sm:text-left">
                  <h3 className="font-black text-[#1b4332] text-xl uppercase">{item.name}</h3>
                  <p className="text-[#40916c] font-black text-xs uppercase">{item.unit}</p>
                  <p className="text-2xl font-black text-[#1b4332] mt-2">Rs. {item.price}</p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4 bg-[#f0f9f4] p-2 rounded-2xl border border-[#d8f3dc]">
                  <button 
                    disabled={actionLoading}
                    onClick={() => handleUpdateQuantity(item.product._id || item.product, item.quantity - 1)}
                    className="w-10 h-10 flex items-center justify-center bg-white rounded-xl text-[#1b4332] hover:bg-[#ffb703] transition-all disabled:opacity-50"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-8 text-center font-black text-[#1b4332] text-lg">{item.quantity}</span>
                  <button 
                    disabled={actionLoading}
                    onClick={() => handleUpdateQuantity(item.product._id || item.product, item.quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center bg-white rounded-xl text-[#1b4332] hover:bg-[#ffb703] transition-all disabled:opacity-50"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                <button 
                  disabled={actionLoading}
                  onClick={() => handleRemoveItem(item.product._id || item.product)}
                  className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                >
                  <Trash2 size={22} />
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:w-1/3">
            <div className="bg-[#1b4332] p-10 rounded-[3.5rem] text-white shadow-2xl sticky top-8">
              <h3 className="text-2xl font-black uppercase mb-8 border-b border-white/10 pb-4">Order Summary</h3>
              <div className="space-y-6 mb-10">
                <div className="flex justify-between font-bold text-white/70 uppercase text-xs">
                  <span>Subtotal</span>
                  <span className="text-white text-lg font-black">Rs. {cart.totalPrice?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-white/70 uppercase text-xs">
                  <span>Delivery</span>
                  <span className="text-[#40916c] text-lg font-black italic">FREE</span>
                </div>
                <div className="h-[1px] bg-white/10"></div>
                <div className="flex justify-between items-end">
                  <span className="font-black text-xl text-[#ffb703] uppercase">Grand Total</span>
                  <span className="text-4xl font-black">Rs. {cart.totalPrice?.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-[10px] font-bold text-white/60 uppercase tracking-widest bg-black/20 p-3 rounded-xl border border-white/5">
                  <Zap size={14} className="text-[#ffb703]" /> Fast Delivery
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold text-white/60 uppercase tracking-widest bg-black/20 p-3 rounded-xl border border-white/5">
                  <ShieldCheck size={14} className="text-[#40916c]" /> Secure Checkout
                </div>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-[#ffb703] text-[#1b4332] py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all uppercase"
              >
                Checkout Now <ArrowRight size={24} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;