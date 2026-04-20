import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Mail, Lock, KeyRound, ArrowRight, ArrowLeft } from "lucide-react";
import axios from "axios";
import logo from "../assets/image.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // 1: Request Code, 2: Reset Password
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  // STEP 1: Request the OTP
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await axios.post("http://localhost:3000/forgot-password", { email });
      if (response.data.success) {
        setStep(2);
        setMessage({ type: "success", text: "A 6-digit code has been sent to your email." });
      }
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || "Failed to send code. Please check your email." 
      });
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Submit OTP and New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await axios.post("http://localhost:3000/reset-password", {
        email,
        otp,
        newPassword,
      });

      if (response.data.success) {
        setMessage({ type: "success", text: "Password updated! Redirecting to login..." });
        setTimeout(() => navigate("/signin"), 2500);
      }
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || "Invalid code or reset failed." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#fbfdfb] font-sans overflow-hidden">
      
      {/* --- LEFT SIDE: THE ARTISTIC HERO --- */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#1b4332]">
        <div 
          className="absolute inset-0 scale-110 animate-[pulse_10s_ease-in-out_infinite] opacity-40 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?q=80&w=2070')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#1b4332]/80 to-[#081c15]"></div>
        <div className="relative z-10 w-full flex flex-col items-center justify-center p-20 text-center">
          <img src={logo} alt="Logo" className="w-40 mb-10 brightness-0 invert" />
          <h1 className="text-5xl font-black text-white leading-tight uppercase tracking-tighter">
            Security <br/> <span className="text-[#52b788]">First.</span>
          </h1>
          <p className="text-white/60 mt-4 max-w-xs mx-auto">
            GharDrop ensures your account remains as secure as our Himalayan roots.
          </p>
        </div>
      </div>

      {/* --- RIGHT SIDE: FORM --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-20 relative">
        <div className="w-full max-w-md animate-[fadeIn_0.8s_ease-out]">
          
          <Link to="/signin" className="flex items-center gap-2 text-[#1b4332] font-black text-[10px] uppercase tracking-widest mb-8 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            Back to Sign In
          </Link>

          <div className="mb-10">
            <h2 className="text-4xl font-black text-[#1b4332] uppercase leading-none">
              {step === 1 ? "Forgot" : "Reset"} <br/> 
              <span className="text-[#40916c]">{step === 1 ? "Password?" : "Security Code"}</span>
            </h2>
            <div className="h-1.5 w-12 bg-[#40916c] mt-4 rounded-full"></div>
          </div>

          <form onSubmit={step === 1 ? handleRequestCode : handleResetPassword} className="space-y-5">
            
            {/* EMAIL FIELD (Visible in both steps, but readonly in step 2) */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#1b4332] uppercase tracking-[0.2em] ml-1">Account Identity</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#40916c] transition-colors" size={20} />
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  readOnly={step === 2}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-12 pr-4 py-5 border-2 rounded-2xl outline-none font-bold transition-all ${
                    step === 2 ? "bg-gray-100 border-gray-100 text-gray-400" : "bg-white border-gray-50 focus:border-[#40916c] shadow-sm"
                  }`}
                />
              </div>
            </div>

            {/* STEP 2 FIELDS: OTP & NEW PASSWORD */}
            {step === 2 && (
              <div className="space-y-5 animate-[slideUp_0.4s_ease-out]">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#1b4332] uppercase tracking-[0.2em] ml-1">Verification Code</label>
                  <div className="relative group">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#40916c] transition-colors" size={20} />
                    <input
                      type="text"
                      required
                      placeholder="6-Digit Code"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full pl-12 pr-4 py-5 bg-white border-2 border-gray-50 rounded-2xl focus:border-[#40916c] outline-none font-bold shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#1b4332] uppercase tracking-[0.2em] ml-1">New Security Code</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#40916c] transition-colors" size={20} />
                    <input
                      type="password"
                      required
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-5 bg-white border-2 border-gray-50 rounded-2xl focus:border-[#40916c] outline-none font-bold shadow-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* FEEDBACK MESSAGES */}
            {message.text && (
              <div className={`p-4 rounded-xl text-[11px] font-black border-l-4 uppercase animate-[shake_0.5s_ease-in-out] ${
                message.type === "success" 
                ? "bg-green-50 text-green-600 border-green-500" 
                : "bg-red-50 text-red-600 border-red-500"
              }`}>
                {message.text}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-[#1b4332] hover:bg-[#2d6a4f] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-xl hover:shadow-[#1b4332]/30 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} /> 
              ) : (
                <>{step === 1 ? "Send Verification Code" : "Update Password"} <ArrowRight size={20} /></>
              )}
            </button>
          </form>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
      `}} />
    </div>
  );
}