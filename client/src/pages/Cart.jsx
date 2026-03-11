import React, { useState } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, Wallet, Banknote } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cart = () => {
  const [showOptions, setShowOptions] = useState(false); // Controls the "Options" view

  // Mock Data
  const cartItems = [{ id: 1, name: 'Organic Red Apples', price: 250, qty: 2, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6bccb?w=200' }];
  const subtotal = 500;
  const deliveryFee = 50;
  const totalAmount = subtotal + deliveryFee;

  // Khalti Payment Function
  const handleKhaltiPayment = () => {
    let config = {
      "publicKey": "test_public_key_dc74e51572594c79930f367065e6b61c",
      "productIdentity": "12345",
      "productName": "GharDrop Order",
      "productUrl": "http://localhost:3000",
      "eventHandler": {
        onSuccess(payload) { console.log("Success", payload); alert("Payment Received!"); },
        onError(error) { console.log(error); },
        onClose() { console.log("Closed"); }
      },
      "paymentPreference": ["KHALTI", "EBANKING", "CONNECT_IPS"],
    };
    let checkout = new window.KhaltiCheckout(config);
    checkout.show({ amount: totalAmount * 100 });
  };

  return (
    <div className="min-h-screen bg-[#f0f9f4] pb-20 pt-28 px-4 md:px-10">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-black text-[#1b4332] tracking-tight">Your Basket</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* 1. ITEMS LIST */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-[#d8f3dc] flex items-center gap-6">
                <div className="w-24 h-24 bg-[#f0f9f4] rounded-2xl overflow-hidden"><img src={item.image} className="w-full h-full object-cover" /></div>
                <div className="flex-grow">
                  <h3 className="text-lg font-black text-[#1b4332]">{item.name}</h3>
                  <p className="text-[#40916c] font-bold text-xl">Rs. {item.price}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 2. SUMMARY SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="bg-[#1b4332] text-white p-8 rounded-[2.5rem] shadow-2xl sticky top-32">
              <h2 className="text-2xl font-black mb-6 border-b border-white/10 pb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-8 text-lg font-bold">
                <div className="flex justify-between opacity-80 font-medium text-sm"><span>Subtotal</span><span>Rs. {subtotal}</span></div>
                <div className="flex justify-between opacity-80 font-medium text-sm"><span>Delivery Fee</span><span>Rs. {deliveryFee}</span></div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                  <span>Total Amount</span>
                  <span className="text-3xl font-black text-[#ffb703]">Rs. {totalAmount}</span>
                </div>
              </div>

              {/* TOGGLE LOGIC HERE */}
              {!showOptions ? (
                // Initial Button
                <button 
                  onClick={() => setShowOptions(true)}
                  className="w-full bg-[#ffb703] text-[#1b4332] py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-white transition-all shadow-xl active:scale-95"
                >
                  PROCEED TO CHECKOUT 
                  <ArrowRight />
                </button>
              ) : (
                // Payment Options (Only shows after clicking Proceed)
                <div className="space-y-4 animate-fade-in">
                  <p className="text-xs uppercase tracking-widest font-black text-[#95d5b2] mb-2">Select Payment Method</p>
                  
                  {/* Khalti Button */}
                  <button 
                    onClick={handleKhaltiPayment}
                    className="w-full bg-[#5C2D91] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all border-2 border-transparent"
                  >
                    <Wallet size={20} /> PAY WITH KHALTI
                  </button>

                  {/* COD Button */}
                  <button 
                    onClick={() => alert("Order Placed via COD!")}
                    className="w-full bg-transparent border-2 border-white/20 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
                  >
                    <Banknote size={20} /> CASH ON DELIVERY
                  </button>

                  <button 
                    onClick={() => setShowOptions(false)}
                    className="w-full text-xs text-[#95d5b2] font-bold mt-2 hover:underline"
                  >
                    Go Back to Summary
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.4s ease forwards; }
      `}</style>
    </div>
  );
};

export default Cart;