import React from 'react';
import logopath from '../assets/image.png'; 

const Loading = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#f0f9f4] overflow-hidden">
      {/* Background Decorative Blobs - Increased Opacity for better contrast */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#1b4332]/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#ffb703]/15 rounded-full blur-[120px] animate-pulse delay-700"></div>

      <div className="relative flex flex-col items-center">
        
        {/* 1. BRAND LOGO CONTAINER - Increased size and added Layered Animations */}
        <div className="relative mb-12 group">
          
          {/* Outer Rotating Dash Ring - Adds a "Processing" feel */}
          <div className="absolute inset-[-30px] border-2 border-dashed border-[#ffb703]/30 rounded-full animate-spin-slow"></div>
          
          {/* Main Logo Glow */}
          <div className="absolute inset-0 bg-[#ffb703] rounded-full blur-[50px] opacity-20 animate-pulse-slow"></div>
          
          {/* The Logo Image - Increased to w-48 (192px) */}
          <div className="relative transform animate-logo-pop">
            <img 
              src={logopath} 
              alt="GharDrop Logo" 
              className="w-48 h-48 md:w-56 md:h-56 object-contain drop-shadow-[0_20px_50px_rgba(27,67,50,0.3)]"
              onError={(e) => {
                e.target.src = "https://cdn-icons-png.flaticon.com/512/2329/2329888.png";
              }} 
            />
          </div>
        </div>

        {/* 2. TEXT & PROGRESSBAR */}
        <div className="text-center space-y-4">
          <div className="overflow-hidden">
             <h1 className="text-5xl font-black tracking-tighter flex items-center justify-center gap-2 animate-text-slide-up">
              <span className="text-[#1b4332]">Ghar</span>
              <span className="relative inline-block text-[#ffb703]">
                Drop Nepal
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] animate-shimmer"></span>
              </span>
            </h1>
          </div>

          <div className="flex flex-col items-center gap-5">
            <p className="text-[#2d6a4f] font-bold text-xs uppercase tracking-[0.5em] opacity-70 animate-fade-in">
              Bringing the Farm to Your Door
            </p>

            {/* Custom Heavy Loading Bar */}
            <div className="w-64 h-2 bg-[#1b4332]/10 rounded-full overflow-hidden p-[2px] border border-[#1b4332]/5">
              <div className="h-full bg-gradient-to-r from-[#1b4332] via-[#40916c] to-[#ffb703] rounded-full w-full animate-load-slide origin-left"></div>
            </div>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        @keyframes logo-pop {
          0%, 100% { transform: scale(1) translateY(0) rotate(0deg); }
          50% { transform: scale(1.1) translateY(-15px) rotate(2deg); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-20deg); }
          100% { transform: translateX(150%) skewX(-20deg); }
        }
        @keyframes load-slide {
          0% { transform: scaleX(0); filter: brightness(1); }
          50% { transform: scaleX(0.7); filter: brightness(1.2); }
          100% { transform: scaleX(1); filter: brightness(1); }
        }
        @keyframes text-slide-up {
          0% { transform: translateY(100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; transform: scale(0.9); }
          50% { opacity: 0.3; transform: scale(1.2); }
        }

        .animate-logo-pop { animation: logo-pop 4s infinite ease-in-out; }
        .animate-spin-slow { animation: spin-slow 12s linear infinite; }
        .animate-shimmer { animation: shimmer 2s infinite ease-in-out; }
        .animate-load-slide { animation: load-slide 2.5s infinite ease-in-out; }
        .animate-text-slide-up { animation: text-slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in { 
          opacity: 0;
          animation: text-slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards; 
        }
        .animate-pulse-slow { animation: pulse-slow 3s infinite ease-in-out; }
      `}</style>
    </div>
  );
};

export default Loading;