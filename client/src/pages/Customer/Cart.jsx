import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Trash2, Plus, Minus, ShoppingBag, 
  ArrowRight, Loader2 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = 'http://localhost:3000'; 

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/getCart`, { withCredentials: true });
      if (data.success) {
        setCart(data.cart);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Could not load basket");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const getProductId = (productField) => {
    if (!productField) return null;
    return typeof productField === 'object' ? productField._id : productField;
  };

  const handleUpdateQuantity = async (item, newQuantity) => {
    const productId = getProductId(item.product);
    if (!productId || newQuantity < 1 || actionLoading) return;
    
    try {
      setActionLoading(true);
      const { data } = await axios.put(`${API_URL}/updateCart`, 
        { productId, quantity: newQuantity }, 
        { withCredentials: true }
      );
      if (data.success) setCart(data.cart);
    } catch (err) { 
      toast.error("Update failed");
    } finally { setActionLoading(false); }
  };

  const handleRemoveItem = async (item) => {
    const productId = getProductId(item.product);
    if (!productId) return;

    try {
      setActionLoading(true);
      const { data } = await axios.delete(`${API_URL}/deleteCart/${productId}`, { withCredentials: true });
      if (data.success) {
        setCart(data.cart);
        toast.success("Item removed");
      }
    } catch (err) { 
      toast.error("Could not remove item");
    } finally { setActionLoading(false); }
  };

  // ADDED: Logic to clear cart state (To be called after successful order)
  const clearCartState = () => {
    setCart({ items: [], totalPrice: 0 });
  };

  const handleProceedToCheckout = () => {
    if (!cart || !cart.items || cart.items.length === 0) return;

    const sanitizedItems = cart.items.map(item => ({
      product: getProductId(item.product), 
      quantity: item.quantity,
      name: item.name,
      price: item.price,
      image: item.image,
      unit: item.unit
    }));

    navigate('/checkout', { 
      state: { 
        items: sanitizedItems, 
        totalAmount: cart.totalPrice 
      } 
    });
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#f0f9f4]">
      <Loader2 className="animate-spin text-[#1b4332]" size={48} />
    </div>
  );

  if (!cart || !cart.items || cart.items.length === 0) return (
    <div className="min-h-screen bg-[#f0f9f4] flex flex-col items-center justify-center p-6 text-center">
      <ShoppingBag size={80} className="text-[#40916c] mb-6 opacity-20" />
      <h2 className="text-3xl font-black text-[#1b4332] uppercase italic">Basket is empty</h2>
      <Link to="/products" className="mt-8 bg-[#1b4332] text-[#ffb703] px-10 py-4 rounded-2xl font-black uppercase tracking-widest">
        Start Shopping
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0f9f4] pb-20">
      {actionLoading && (
        <div className="fixed inset-0 bg-black/5 z-50 flex items-center justify-center pointer-events-none">
           <Loader2 className="animate-spin text-[#1b4332] opacity-50" size={32} />
        </div>
      )}

      <div className="bg-[#1b4332] pt-16 pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl font-black text-white uppercase tracking-tighter">
            My <span className="text-[#ffb703]">Basket</span>
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-12 space-y-6">
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
          {cart.items.map((item) => {
            const productId = getProductId(item.product);
            if (!productId) return null;

            return (
              <div key={productId} className="p-6 border-b border-[#f0f9f4] flex items-center gap-6">
                <img src={item.image} alt={item.name} className="w-24 h-24 rounded-3xl object-cover" />
                
                <div className="flex-grow">
                  <h3 className="font-black text-[#1b4332] uppercase text-lg">{item.name}</h3>
                  <p className="font-bold text-[#40916c]">Rs. {item.price}</p>
                </div>

                <div className="flex items-center gap-4 bg-[#f0f9f4] p-3 rounded-2xl">
                  <button 
                    onClick={() => handleUpdateQuantity(item, item.quantity - 1)} 
                    className="p-1 text-[#1b4332]"
                    disabled={actionLoading}
                  >
                    <Minus size={18}/>
                  </button>
                  <span className="font-black text-xl w-6 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => handleUpdateQuantity(item, item.quantity + 1)} 
                    className="p-1 text-[#1b4332]"
                    disabled={actionLoading}
                  >
                    <Plus size={18}/>
                  </button>
                </div>

                <button 
                  onClick={() => handleRemoveItem(item)} 
                  className="bg-red-50 p-3 rounded-2xl text-red-300 hover:text-red-600"
                  disabled={actionLoading}
                >
                  <Trash2 size={22}/>
                </button>
              </div>
            );
          })}

          <div className="p-10 bg-[#f8fdfa] flex justify-between items-center border-t-4 border-[#1b4332]">
            <div>
              <span className="font-black text-[#1b4332] uppercase tracking-[0.3em] text-xs block mb-1">Subtotal</span>
              <span className="text-4xl font-black text-[#1b4332]">Rs. {cart.totalPrice}</span>
            </div>
          </div>
        </div>

        <button 
          onClick={handleProceedToCheckout}
          disabled={actionLoading || cart.items.length === 0}
          className="w-full bg-[#ffb703] text-[#1b4332] py-8 rounded-[2rem] font-black text-2xl uppercase shadow-lg flex items-center justify-center gap-4 hover:translate-y-[-4px] active:scale-95 transition-all"
        >
          Proceed to Checkout <ArrowRight size={28} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default Cart;