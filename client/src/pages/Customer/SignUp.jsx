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
      setPreviewUrl(URL.createObjectURL(file)); // Generate temporary preview
    }
  };

  // STEP 1: Submit Registration (Using FormData)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("email", email.toLowerCase().trim());
    formData.append("phoneNumber", phoneNumber);
    formData.append("password", password);
    formData.append("role", role);

    // Conditional Fields
    if (role === "vendor") {
      formData.append("storeName", storeName);
      formData.append("storeAddress", storeAddress);
      if (selectedFile) formData.append("storeImage", selectedFile);
    }

    if (role === "deliveryBoy") {
      formData.append("vehicleType", vehicleType);
      formData.append("vehicleNumber", vehicleNumber);
      formData.append("licenseNumber", licenseNumber);
      if (selectedFile) formData.append("deliveryLicenseImage", selectedFile);
    }

    try {
      const res = await axios.post("http://localhost:3000/signup", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setMessage(res.data.message);
      setStep(2); 
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
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
              <h2 className="text-3xl font-black text-[#1b4332] tracking-tight">Get Started</h2>
              <p className="text-gray-400 font-medium">Join the GharDrop Nepal community</p>
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
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all uppercase ${role === r ? 'bg-white text-green-700 shadow-sm' : 'text-gray-400'}`}
                  >
                    {r.replace('Boy', '')}
                  </button>
                ))}
              </div>

              {/* --- ROLE SPECIFIC INPUTS --- */}
              {role !== 'customer' && (
                <div className={`p-6 rounded-3xl border-2 border-dashed ${role === 'vendor' ? 'border-green-200 bg-green-50/30' : 'border-blue-200 bg-blue-50/30'} space-y-4 animate-in fade-in slide-in-from-top-2`}>
                  <p className="flex items-center gap-2 text-xs font-black uppercase text-gray-600">
                    {role === 'vendor' ? <Store size={14} /> : <Truck size={14} />} 
                    {role} Registration Details
                  </p>

                  {role === "vendor" ? (
                    <>
                      <input type="text" placeholder="Store Name" required value={storeName} onChange={(e) => setStoreName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-white outline-none" />
                      <input type="text" placeholder="Store Address" required value={storeAddress} onChange={(e) => setStoreAddress(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-white outline-none" />
                    </>
                  ) : (
                    <>
                      <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-white outline-none bg-white">
                        <option value="bike">Bike</option>
                        <option value="scooter">Scooter</option>
                      </select>
                      <input type="text" placeholder="Vehicle Number (e.g. BA 2 PA 1234)" required value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-white outline-none" />
                      <input type="text" placeholder="Driving License Number" required value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-white outline-none" />
                    </>
                  )}

                  {/* Image Upload Area */}
                  <div className="relative group">
                    <input type="file" accept="image/*" required onChange={handleFileChange} className="hidden" id="fileUpload" />
                    <label htmlFor="fileUpload" className="cursor-pointer flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-transparent group-hover:border-green-400 transition-all">
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
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
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
            <ShieldCheck size={48} className="mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-black text-[#1b4332] mb-2">Verify Identity</h2>
            <p className="text-sm text-gray-400 mb-8">Enter the code sent to your email.</p>
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <input type="text" maxLength="6" required value={otp} onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-4 text-center text-4xl tracking-[0.5em] font-black border-2 border-green-50 rounded-2xl focus:border-green-500 outline-none transition-all"
                placeholder="000000" />
              <button type="submit" disabled={loading || otp.length < 6} className="w-full bg-[#1b4332] text-white py-4 rounded-2xl font-bold">
                {loading ? "Verifying..." : "Confirm & Sign Up"}
              </button>
            </form>
          </div>
        )}

        {message && (
          <div className={`mt-6 p-4 rounded-2xl text-xs font-black uppercase tracking-widest text-center border ${
            message.includes('successfully') || message.includes('sent') ? 'text-green-700 bg-green-50 border-green-100' : 'text-red-700 bg-red-50 border-red-100'
          }`}>
            {message}
          </div>
        )}

        <p className="text-center mt-8 text-xs font-bold text-gray-400 uppercase">
          Already have an account? <Link to="/signin" className="text-green-600 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}