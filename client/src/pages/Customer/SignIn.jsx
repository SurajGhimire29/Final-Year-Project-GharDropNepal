import React, { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-hot-toast";

import axios from "axios";

import logo from "../../assets/image.png";

export default function SignIn() {
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);


  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();


    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3000/signin",

        { email, password },

        { withCredentials: true },
      );

      const data = response.data;

      if (data.success) {
        localStorage.setItem("userId", data.user._id);

        localStorage.setItem("userRole", data.user.role);

        localStorage.setItem("userName", data.user.fullName);

        if (data.user.avatar && data.user.avatar.url) {
          localStorage.setItem("userAvatar", data.user.avatar.url);
        }

        window.dispatchEvent(new Event("storage"));
        toast.success(`Welcome back, ${data.user.fullName}!`);

        switch (data.user.role) {
          case "admin":
            navigate("/admin-dashboard");
            break;

          case "vendor":
            navigate("/vendor-dashboard");
            break;

          case "deliveryBoy":
            navigate("/delivery-dashboard");
            break;

          default:
            navigate("/home");
            break;
        }
      } else {
        toast.error(data.message || "Invalid email or password.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Connection failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#fbfdfb] font-sans overflow-hidden">
      {/* --- LEFT SIDE: THE ARTISTIC HERO --- */}

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#1b4332]">
        {/* Animated Background Image */}

        <div
          className="absolute inset-0 scale-110 animate-[pulse_10s_ease-in-out_infinite] opacity-60 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1543083477-4f785aeafaa9?q=80&w=2070&auto=format&fit=crop')`,
          }}
        ></div>

        {/* Deep Green Overlay */}

        <div className="absolute inset-0 bg-gradient-to-b from-[#1b4332]/80 via-[#1b4332]/90 to-[#081c15]"></div>

        <div className="relative z-10 w-full flex flex-col items-center justify-center p-20 text-center">
          {/* THE BIG ANIMATED LOGO */}

          <div className="mb-10 animate-[bounce_3s_ease-in-out_infinite]">
            <img
              src={logo}
              alt="GharDrop Nepal"
              className="w-56 h-auto drop-shadow-[0_20px_50px_rgba(255,255,255,0.2)] brightness-0 invert"
            />
          </div>

          <h1 className="text-6xl font-black text-white leading-none uppercase tracking-tighter mb-4">
            Freshness <br /> <span className="text-[#52b788]">Reimagined.</span>
          </h1>

          <p className="text-white/60 text-lg font-medium max-w-sm mx-auto mb-10">
            Connecting Himalayan farmers to your doorstep with one simple click.
          </p>

          <div className="flex gap-4">
            <div className="px-4 py-2 bg-white/10 rounded-full backdrop-blur-md border border-white/20 flex items-center gap-2 text-white text-[10px] font-bold uppercase">
              <CheckCircle2 size={14} className="text-[#52b788]" /> Fastest
              Delivery
            </div>

            <div className="px-4 py-2 bg-white/10 rounded-full backdrop-blur-md border border-white/20 flex items-center gap-2 text-white text-[10px] font-bold uppercase">
              <CheckCircle2 size={14} className="text-[#52b788]" /> 100% Organic
            </div>
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: LOGIN FORM --- */}

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-20 relative">
        {/* Mobile Logo Only */}

        <div className="lg:hidden mb-8">
          <img src={logo} alt="Logo" className="w-32 animate-pulse" />
        </div>

        <div className="w-full max-w-md animate-[fadeIn_1s_ease-out]">
          <div className="mb-10">
            <h2 className="text-5xl font-black text-[#1b4332] tracking-tight uppercase leading-none">
              Welcome <br /> <span className="text-[#40916c]">Back.</span>
            </h2>

            <div className="h-1.5 w-12 bg-[#40916c] mt-4 rounded-full"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* EMAIL FIELD */}

            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#1b4332] uppercase tracking-[0.2em] ml-1">
                Account Identity
              </label>

              <div className="relative group">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#40916c] transition-colors"
                  size={20}
                />

                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-5 bg-white border-2 border-gray-50 rounded-2xl focus:border-[#40916c] focus:bg-white outline-none transition-all text-[#1b4332] font-bold shadow-sm"
                />
              </div>
            </div>

            {/* PASSWORD FIELD */}

            <div className="space-y-1">
              <div className="flex justify-between items-end ml-1">
                <label className="text-[10px] font-black text-[#1b4332] uppercase tracking-[0.2em]">
                  Security Code
                </label>

                {/* Forgot Password Link */}

                <Link
                  to="/forgot-password"
                  className="text-[10px] font-bold text-[#40916c] hover:text-[#1b4332] uppercase tracking-wider transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#40916c] transition-colors"
                  size={20}
                />

                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-5 bg-white border-2 border-gray-50 rounded-2xl focus:border-[#40916c] focus:bg-white outline-none transition-all text-[#1b4332] font-bold shadow-sm"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1b4332]"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>


            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1b4332] hover:bg-[#2d6a4f] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-xl hover:shadow-[#1b4332]/30 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  Sign In <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
              New to the community?
            </p>

            <Link
              to="/signup"
              className="mt-2 inline-block text-[#1b4332] font-black text-sm border-b-2 border-[#52b788] hover:text-[#40916c] transition-all"
            >
              CREATE AN ACCOUNT
            </Link>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `

        @keyframes fadeIn {

          from { opacity: 0; transform: translateY(20px); }

          to { opacity: 1; transform: translateY(0); }

        }

        @keyframes shake {

          0%, 100% { transform: translateX(0); }

          25% { transform: translateX(-5px); }

          75% { transform: translateX(5px); }

        }

      `,
        }}
      />
    </div>
  );
}
