import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  CheckCircle, 
  ShoppingBag, 
  ArrowRight, 
  Truck, 
  PartyPopper 
} from "lucide-react";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderInfo = location.state || { orderId: "GD-" + Math.floor(1000 + Math.random() * 9000) };

  // Smooth scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#f0f9f4] flex items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full">
        {/* MAIN CARD */}
        <div className="bg-white rounded-[4rem] shadow-2xl border border-[#d8f3dc] overflow-hidden animate-in fade-in zoom-in-95 duration-700">
          
          {/* HEADER SECTION */}
          <div className="bg-[#1b4332] p-12 text-center relative overflow-hidden">
            {/* Animated background patterns */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#ffb703] rounded-full blur-3xl animate-pulse"></div>
            </div>

            <div className="relative z-10">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/20 animate-bounce">
                <CheckCircle className="text-[#ffb703]" size={48} strokeWidth={3} />
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">
                Order <span className="text-[#ffb703]">Confirmed!</span>
              </h1>
              <p className="text-[#b7e4c7] font-bold uppercase text-[10px] tracking-[0.3em]">
                Your Himalayan harvest is on its way
              </p>
            </div>
          </div>

          {/* CONTENT SECTION */}
          <div className="p-10 md:p-16 text-center space-y-8">
            <div className="space-y-2">
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Tracking Reference</p>
              <h3 className="text-2xl font-black text-[#1b4332] tracking-widest">{orderInfo.orderId}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#f8fdfa] p-6 rounded-[2.5rem] border border-[#d8f3dc] flex flex-col items-center gap-2">
                <Truck className="text-[#40916c]" size={24} />
                <p className="text-xs font-black text-[#1b4332] uppercase">Express Delivery</p>
                <p className="text-[10px] font-medium text-gray-400">Arriving in 30-45 mins</p>
              </div>
              <div className="bg-[#f8fdfa] p-6 rounded-[2.5rem] border border-[#d8f3dc] flex flex-col items-center gap-2">
                <PartyPopper className="text-[#ffb703]" size={24} />
                <p className="text-xs font-black text-[#1b4332] uppercase">Freshness Gaurantee</p>
                <p className="text-[10px] font-medium text-gray-400">Direct from local farms</p>
              </div>
            </div>

            <p className="text-gray-500 font-medium leading-relaxed max-w-sm mx-auto italic">
              "Thank you for supporting local farmers and sustainable agriculture in Nepal."
            </p>

            {/* ACTION BUTTONS */}
            <div className="pt-6 space-y-4">
              <button 
                onClick={() => navigate('/history')}
                className="w-full py-5 bg-[#1b4332] text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-[#2d6a4f] transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
              >
                Track Live Order <ArrowRight size={20} />
              </button>
              
              <button 
                onClick={() => navigate('/')}
                className="w-full py-4 bg-transparent text-[#1b4332] rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-[#f0f9f4] transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} /> Continue Shopping
              </button>
            </div>
          </div>

          {/* FOOTER BAR */}
          <div className="bg-[#f8fdfa] py-6 border-t border-[#d8f3dc] text-center">
             <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.5em]">GharDrop Nepal • Authentic • Fresh • Local</p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}} />
    </div>
  );
};

export default OrderSuccess;
