import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import logo from "../../assets/image.png";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      // Send POST request to backend with credentials
      const response = await axios.post(
        "http://localhost:3000/signin",
        { email, password },
        { withCredentials: true } // Crucial for storing JWT cookies
      );

      const data = response.data;

      if (data.success) {
        // 1. Save essential user info locally
        localStorage.setItem("userRole", data.user.role);
        localStorage.setItem("userName", data.user.fullName);

        // 2. Role-based redirection logic
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
          case "customer":
          default:
            navigate("/home");
            break;
        }
      } else {
        setErrorMessage(data.message || "Invalid email or password.");
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Connection failed. Please check your server."
      );
      console.error("Login Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f9f4] px-4 font-sans text-left">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 border border-[#d8f3dc]">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <img 
            src={logo} 
            alt="GharDrop Nepal" 
            className="w-28 h-auto mb-4 hover:scale-110 transition-transform duration-300" 
          />
          <h2 className="text-3xl font-black text-[#1b4332] tracking-tighter uppercase">Welcome Back</h2>
          <p className="text-gray-400 text-sm font-bold mt-1">LOG IN TO YOUR ACCOUNT</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div className="space-y-1">
            <label className="text-xs font-black text-[#1b4332] uppercase ml-1 tracking-widest">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                name="email"                // Added to fix DOM warning
                autoComplete="username"     // Added to fix DOM warning
                required
                placeholder="ghardrop@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-[#f8fcf9] border border-[#d8f3dc] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#40916c] transition-all text-[#1b4332] font-medium"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-black text-[#1b4332] uppercase tracking-widest">Password</label>
              <Link to="/forgot-password" size={18} className="text-[#40916c] text-[10px] font-bold hover:underline">FORGOT?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"               // Added to fix DOM warning
                autoComplete="current-password" // THIS LINE FIXES THE [DOM] ERROR
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-[#f8fcf9] border border-[#d8f3dc] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#40916c] transition-all text-[#1b4332] font-medium"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1b4332]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error Message Display */}
          {errorMessage && (
            <div className="bg-red-50 text-red-600 text-xs font-bold p-4 rounded-2xl border border-red-100 animate-shake">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1b4332] hover:bg-[#2d6a4f] text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-[#1b4332]/20 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} /> VERIFYING...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-sm text-gray-500 mt-8 font-medium">
          New to GharDrop?{" "}
          <Link to="/signup" className="text-[#40916c] hover:text-[#1b4332] font-black underline decoration-2 underline-offset-4">
            CREATE ACCOUNT
          </Link>
        </p>
      </div>
    </div>
  );
}