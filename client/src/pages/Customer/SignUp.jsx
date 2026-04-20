import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Camera, Store, Truck, User, ArrowRight, ShieldCheck } from "lucide-react";
import logo from "../../assets/image.png"; 

export default function SignUp() {
  // --- Basic Form States ---
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("customer");

  // --- Role-Specific Data States ---
  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [vehicleType, setVehicleType] = useState("bike");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");

  // --- File States & Previews ---
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // --- UI & Verification States ---
  const [otp, setOtp] = useState(""); 
  const [step, setStep] = useState(1); 
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Handle Image Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); 
    }
  };

  // STEP 1: Submit Registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);

    // Create FormData Object
    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("email", email.toLowerCase().trim());
    formData.append("phoneNumber", phoneNumber);
    formData.append("password", password);
    formData.append("role", role);

    // Conditional Fields based on Role
    if (role === "vendor") {
      formData.append("storeName", storeName);
      formData.append("storeAddress", storeAddress);
      // KEY: Must match authRouter.js -> upload.fields([{ name: "storeImage" }])
      if (selectedFile) {
        formData.append("storeImage", selectedFile);
      }
    }

    if (role === "deliveryBoy") {
      formData.append("vehicleType", vehicleType);
      formData.append("vehicleNumber", vehicleNumber);
      formData.append("licenseNumber", licenseNumber);
      // KEY: Must match authRouter.js -> upload.fields([{ name: "deliveryLicenseImage" }])
      if (selectedFile) {
        formData.append("deliveryLicenseImage", selectedFile);
      }
    }

    try {
      const res = await axios.post("http://localhost:3000/signup", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      if (res.data.success) {
        setMessage(res.data.message || "OTP sent to your email!");
        setStep(2); 
      }
    } catch (error) {
      console.error("Signup error:", error);
      setMessage(error.response?.data?.message || "Registration failed. Please check backend console.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post("http://localhost:3000/emailotpverification", {
        email: email.toLowerCase().trim(),
        otp: otp, 
      });

      if (res.data.success) {
        alert("Verification successful! Redirecting to login...");
        navigate("/signin");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Invalid OTP code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 border border-green-100">
        
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="GharDropNepal" className="w-20 h-auto mb-2" />
          <div className="h-1.5 w-12 bg-[#1b4332] rounded-full"></div>
        </div>

        {step === 1 ? (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-[#1b4332] tracking-tight italic uppercase">Join GharDrop</h2>
              <p className="text-gray-400 font-medium text-xs uppercase tracking-widest">Create your {role} account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Full Name</label>
                  <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-green-500 transition-all outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Phone</label>
                  <input type="text" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-green-500 transition-all outline-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Email Address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-green-500 transition-all outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Password</label>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-green-500 transition-all outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Confirm</label>
                  <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-green-500 transition-all outline-none" />
                </div>
              </div>

              <div className="p-1 bg-gray-100 rounded-2xl flex items-center">
                {['customer', 'vendor', 'deliveryBoy'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setRole(r); setSelectedFile(null); setPreviewUrl(null); }}
                    className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all uppercase ${role === r ? 'bg-[#1b4332] text-[#ffb703] shadow-sm' : 'text-gray-400'}`}
                  >
                    {r === 'deliveryBoy' ? 'Delivery' : r}
                  </button>
                ))}
              </div>

              {/* --- ROLE SPECIFIC INPUTS --- */}
              {role !== 'customer' && (
                <div className={`p-6 rounded-3xl border-2 border-dashed ${role === 'vendor' ? 'border-green-200 bg-green-50/30' : 'border-blue-200 bg-blue-50/30'} space-y-4 animate-in fade-in slide-in-from-top-2`}>
                  <p className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-600 tracking-widest">
                    {role === 'vendor' ? <Store size={14} className="text-green-600" /> : <Truck size={14} className="text-blue-600" />} 
                    {role} Verification
                  </p>

                  {role === "vendor" ? (
                    <>
                      <input type="text" placeholder="Store Name" required value={storeName} onChange={(e) => setStoreName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-white outline-none shadow-sm" />
                      <input type="text" placeholder="Store Address" required value={storeAddress} onChange={(e) => setStoreAddress(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-white outline-none shadow-sm" />
                    </>
                  ) : (
                    <>
                      <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-white outline-none bg-white shadow-sm font-bold text-gray-600">
                        <option value="bike">Bike</option>
                        <option value="scooter">Scooter</option>
                        <option value="van">Van</option>
                      </select>
                      <input type="text" placeholder="Vehicle Number (e.g. BA 2 PA 1234)" required value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-white outline-none shadow-sm" />
                      <input type="text" placeholder="Driving License Number" required value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-white outline-none shadow-sm" />
                    </>
                  )}

                  {/* Image Upload Area */}
                  <div className="relative group">
                    <input type="file" accept="image/*" required onChange={handleFileChange} className="hidden" id="fileUpload" />
                    <label htmlFor="fileUpload" className="cursor-pointer flex flex-col items-center justify-center p-6 bg-white rounded-2xl border-2 border-transparent group-hover:border-[#1b4332] transition-all shadow-sm">
                      {previewUrl ? (
                        <div className="relative w-full h-32">
                          <img src={previewUrl} className="w-full h-full object-cover rounded-xl" alt="Preview" />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white" />
                          </div>
                        </div>
                      ) : (
                        <>
                          <Camera className="text-gray-300 mb-2" size={32} />
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">
                            {role === 'vendor' ? 'Upload Store Photo' : 'Upload License Photo'}
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full bg-[#1b4332] hover:bg-[#081c15] text-[#ffb703] py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:bg-gray-200">
                {loading ? "Processing..." : <>Create Account <ArrowRight size={18} /></>}
              </button>
            </form>
          </>
        ) : (
          /* --- OTP VIEW --- */
          <div className="text-center animate-in fade-in zoom-in-95">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <ShieldCheck size={40} className="text-[#1b4332]" />
            </div>
            <h2 className="text-2xl font-black text-[#1b4332] mb-2 uppercase italic">Verify Identity</h2>
            <p className="text-[10px] font-bold text-gray-400 mb-8 uppercase tracking-widest">A 6-digit code was sent to {email}</p>
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <input type="text" maxLength="6" required value={otp} onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-4 text-center text-4xl tracking-[0.4em] font-black border-2 border-gray-50 rounded-3xl focus:border-[#1b4332] outline-none transition-all bg-gray-50"
                placeholder="000000" />
              <button type="submit" disabled={loading || otp.length < 6} className="w-full bg-[#1b4332] text-[#ffb703] py-4 rounded-2xl font-black uppercase tracking-widest">
                {loading ? "Verifying..." : "Confirm & Sign Up"}
              </button>
            </form>
          </div>
        )}

        {message && (
          <div className={`mt-6 p-4 rounded-2xl text-[9px] font-black uppercase tracking-widest text-center border ${
            message.toLowerCase().includes('success') || message.toLowerCase().includes('sent') 
              ? 'text-green-700 bg-green-50 border-green-100' 
              : 'text-red-700 bg-red-50 border-red-100'
          }`}>
            {message}
          </div>
        )}

        <p className="text-center mt-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Already a member? <Link to="/signin" className="text-[#1b4332] hover:underline ml-1">Sign In</Link>
        </p>
      </div>
    </div>
  );
}