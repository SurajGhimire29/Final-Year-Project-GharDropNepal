import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/image.png"; 

export default function SignUp() {
  // Form States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("customer");
  
  // Verification States
  const [otp, setOtp] = useState(""); 
  const [step, setStep] = useState(1); // 1: Signup Form, 2: OTP Box
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // STEP 1: Submit Registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:3000/signup", {
        fullName,
        email: email.toLowerCase().trim(),
        phoneNumber,
        password,
        role,
      });

      setMessage(res.data.message);
      setStep(2); // Move to OTP verification screen
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Submit OTP Verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // FIX: Converting OTP to Number to match your Backend Controller
      const payload = {
        email: email.toLowerCase().trim(),
        otp: Number(otp), 
      };

      const res = await axios.post("http://localhost:3000/emailotpverification", payload);

      if (res.data.success) {
        alert("Verification successful! Redirecting to login...");
        navigate("/signin");
      }
    } catch (error) {
      console.error("Verification Error:", error.response?.data);
      setMessage(error.response?.data?.message || "Invalid OTP code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-green-100">
        
        {/* Branding */}
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="GharDropNepal" className="w-32 h-auto mb-2" />
          <div className="h-1 w-12 bg-green-500 rounded-full"></div>
        </div>

        {step === 1 ? (
          /* --- SIGNUP FORM VIEW --- */
          <>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create Account</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600">Full Name</label>
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600">Email Address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600">Phone Number</label>
                <input type="text" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 outline-none transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600">Password</label>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600">Confirm</label>
                  <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600">I am a...</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 outline-none bg-white">
                  <option value="customer">Customer</option>
                  <option value="vendor">Vendor</option>
                  <option value="deliveryBoy">Delivery Boy</option>
                </select>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-100 transition-all active:scale-95 disabled:bg-green-300">
                {loading ? "Processing..." : "Register Now"}
              </button>
            </form>
          </>
        ) : (
          /* --- OTP VERIFICATION VIEW --- */
          <>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Verify Email</h2>
            <p className="text-center text-sm text-gray-500 mb-8 px-4">
              We've sent a 6-digit code to <span className="font-bold text-green-600">{email}</span>
            </p>

            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength="6"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-4 py-4 text-center text-4xl tracking-[0.6em] font-black border-2 border-green-100 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-50 outline-none transition-all placeholder:text-gray-200"
                  placeholder="000000"
                />
              </div>

              <button type="submit" disabled={loading || otp.length < 6} className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-green-100 transition-all active:scale-95 disabled:bg-gray-200 disabled:text-gray-400">
                {loading ? "Verifying..." : "Verify & Create Account"}
              </button>

              <button type="button" onClick={() => { setStep(1); setMessage(""); }} className="w-full text-gray-400 text-sm hover:text-green-600 transition underline decoration-dotted">
                Use a different email address
              </button>
            </form>
          </>
        )}

        {/* Dynamic Status Messages */}
        {message && (
          <div className={`mt-6 p-4 rounded-xl text-sm font-medium border text-center animate-pulse ${
            message.toLowerCase().includes('successfully') || message.toLowerCase().includes('sent') 
              ? 'text-green-800 bg-green-50 border-green-100' 
              : 'text-red-800 bg-red-50 border-red-100'
          }`}>
            {message}
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-8">
          Already a member?
          <Link to="/signin" className="text-green-600 font-bold hover:underline ml-1">Sign In</Link>
        </p>
      </div>
    </div>
  );
}