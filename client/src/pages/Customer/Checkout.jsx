import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Phone, ArrowLeft, Loader2, Banknote, CreditCard, Crosshair, Navigation, ArrowRight } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { toast } from 'react-hot-toast';

const deliveryIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

// --- HELPER COMPONENTS ---
function MapController({ markerPos, showMap }) {
  const map = useMap();
  useEffect(() => {
    if (showMap && markerPos) {
      map.flyTo(markerPos, 17, { animate: true });
      // Invalidate size ensures the map tiles load correctly if the container was hidden
      setTimeout(() => map.invalidateSize(), 300);
    }
  }, [showMap, markerPos, map]);
  return null;
}

function LocationPicker({ setMarkerPos, reverseGeocode, setSource }) {
  useMapEvents({
    dragend(e) {
      const center = e.target.getCenter();
      setSource('map');
      setMarkerPos([center.lat, center.lng]);
      reverseGeocode(center.lat, center.lng);
    },
    click(e) {
      setSource('map');
      setMarkerPos([e.latlng.lat, e.latlng.lng]);
      reverseGeocode(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { items, totalAmount: subtotal } = location.state || { items: [], totalAmount: 0 };

  const deliveryCharge = parseFloat((subtotal * 0.05).toFixed(2));
  const finalTotal = subtotal + deliveryCharge;

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Online"); 
  const [isOrdering, setIsOrdering] = useState(false);

  // Default to Pokhara Center
  const [markerPos, setMarkerPos] = useState([28.2096, 83.9856]); 
  const [showMap, setShowMap] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [source, setSource] = useState('typing'); 

  const API_BASE_URL = 'http://localhost:3000';

  // --- Geocoding Logic ---
  useEffect(() => {
    if (source !== 'typing' || !address || address.length < 5) return;
    const delayDebounceFn = setTimeout(async () => {
      try {
        const query = `${address}, Pokhara, Nepal`;
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
        const data = await res.json();
        if (data && data.length > 0) {
          const newPos = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
          // Stay within Pokhara bounds approximately
          if (newPos[0] > 28.0 && newPos[0] < 28.5) setMarkerPos(newPos);
        }
      } catch (err) { console.error("Search Error:", err); }
    }, 1000); 
    return () => clearTimeout(delayDebounceFn);
  }, [address, source]);

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.address) {
        const place = data.address.road || data.address.suburb || data.address.amenity || "Selected Location";
        const city = data.address.city || data.address.town || "Pokhara";
        setAddress(`${place}, ${city}`);
      }
    } catch (err) { console.error(err); }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = [position.coords.latitude, position.coords.longitude];
          setSource('map');
          setMarkerPos(coords);
          reverseGeocode(coords[0], coords[1]);
          setIsLocating(false);
        },
        () => {
            toast.error("Could not get location. Please select on map.");
            setIsLocating(false);
        }
      );
    }
  };

  useEffect(() => { 
    getUserLocation(); 
  }, []);

  // --- FINAL SUBMISSION LOGIC ---
  const handleConfirmOrder = async () => {
    if (!address || !phone) {
      toast.error("Please provide both address and phone number.");
      return;
    }

    // MATCHING YOUR BACKEND CONTROLLER EXPECTATIONS:
    // Your controller uses coordinates[0] and coordinates[1]
    const shippingDetails = {
        addressLine: address,
        phoneNumber: phone,
        city: "Pokhara",
        coordinates: [markerPos[0], markerPos[1]] // Changed from object to array
    };

    const orderPayload = {
        items,
        totalAmount: finalTotal,
        shippingAddress: shippingDetails,
        paymentDetails: {
            method: paymentMethod,
            status: "Pending"
        }
    };

    if (paymentMethod === "COD") {
        setIsOrdering(true);
        try {
            // Updated route to match common conventions, ensure this matches your backend route
            const { data } = await axios.post(`${API_BASE_URL}/order/new`, orderPayload, {
                withCredentials: true 
            });

            if (data.success) {
                toast.success("GharDrop Order Placed!");
                navigate('/order-success', { state: { orderId: data.order?.orderId || null } }); 
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to place order.");
        } finally {
            setIsOrdering(false);
        }
    } else {
        navigate('/payment', { 
            state: { 
                items, 
                amount: finalTotal, 
                shippingAddress: shippingDetails 
            } 
        });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fdfa] pb-10 font-sans">
      <div className="max-w-xl mx-auto px-4 pt-8 text-left">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#1b4332] font-bold text-xs mb-6 opacity-60 hover:opacity-100 transition-all">
          <ArrowLeft size={14}/> BACK TO CART
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-[#e8f5ec] overflow-hidden">
          <div className="bg-[#1b4332] p-8 text-white">
            <h2 className="text-2xl font-black uppercase tracking-tight">GharDrop <span className="text-[#ffb703]">Checkout</span></h2>
            <div className="flex items-center gap-2 mt-1">
                <div className="h-2 w-2 rounded-full bg-[#ffb703] animate-pulse"></div>
                <p className="text-[#b7e4c7] text-[10px] font-bold uppercase tracking-widest">Pokhara Delivery Service</p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Location Section */}
            <div className="space-y-1">
                <label className="text-[10px] font-black text-[#1b4332] uppercase ml-1 opacity-50">Delivery Point</label>
                <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#40916c]" size={18}/>
                    <input 
                        type="text" placeholder="House/Street/Area..." 
                        className="w-full bg-[#f0f9f4] border-2 border-transparent focus:border-[#1b4332] p-4 pl-12 pr-12 rounded-2xl transition-all font-bold text-[#1b4332] text-sm"
                        value={address} 
                        onChange={(e) => {
                          setSource('typing');
                          setAddress(e.target.value);
                        }}
                    />
                    <button 
                      onClick={() => setShowMap(!showMap)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${showMap ? 'bg-[#ffb703] text-[#1b4332]' : 'bg-[#1b4332] text-white'}`}
                    >
                      <Crosshair size={18} />
                    </button>
                </div>

                {showMap && (
                  <div className="relative w-full h-72 rounded-3xl overflow-hidden border-2 border-[#e8f5ec] mt-2 shadow-inner">
                    <MapContainer center={markerPos} zoom={16} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <MapController markerPos={markerPos} showMap={showMap} />
                      <LocationPicker setMarkerPos={setMarkerPos} reverseGeocode={reverseGeocode} setSource={setSource} />
                      <Marker position={markerPos} icon={deliveryIcon} />
                    </MapContainer>
                    <button 
                      onClick={getUserLocation}
                      className="absolute bottom-4 right-4 z-[1000] bg-white p-3 rounded-2xl shadow-xl text-[#1b4332] hover:bg-[#f0f9f4]"
                    >
                      {isLocating ? <Loader2 size={20} className="animate-spin" /> : <Navigation size={20} />}
                    </button>
                  </div>
                )}
            </div>

            {/* Contact Section */}
            <div className="space-y-1">
                <label className="text-[10px] font-black text-[#1b4332] uppercase ml-1 opacity-50">Contact Phone</label>
                <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#40916c]" size={18}/>
                    <input 
                        type="text" placeholder="98XXXXXXXX" 
                        className="w-full bg-[#f0f9f4] border-2 border-transparent focus:border-[#1b4332] p-4 pl-12 rounded-2xl transition-all font-bold text-[#1b4332]"
                        value={phone} onChange={(e) => setPhone(e.target.value)}
                    />
                </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1">
                <label className="text-[10px] font-black text-[#1b4332] uppercase ml-1 opacity-50">Choose Payment</label>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setPaymentMethod("Online")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-3xl border-2 transition-all ${paymentMethod === 'Online' ? 'border-[#5C2D91] bg-[#f4f0f9] text-[#5C2D91] shadow-md' : 'border-[#e8f5ec] text-gray-400'}`}
                    >
                        <CreditCard size={24} />
                        <span className="font-black text-[10px] uppercase">Online Pay</span>
                    </button>
                    <button 
                      onClick={() => setPaymentMethod("COD")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-3xl border-2 transition-all ${paymentMethod === 'COD' ? 'border-[#1b4332] bg-[#f0f9f4] text-[#1b4332] shadow-md' : 'border-[#e8f5ec] text-gray-400'}`}
                    >
                        <Banknote size={24} />
                        <span className="font-black text-[10px] uppercase">Cash on Delivery</span>
                    </button>
                </div>
            </div>

            {/* Summary Breakdown */}
            <div className="bg-[#f0f9f4] border border-[#d8f3dc] p-5 rounded-[2rem] space-y-2 mt-4 text-left">
                <div className="flex justify-between items-center text-[#1b4332]/60 font-bold text-xs uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span>Rs. {subtotal}</span>
                </div>
                <div className="flex justify-between items-center text-[#40916c] font-black text-xs uppercase tracking-widest">
                    <span>Delivery Fee (5%)</span>
                    <span>Rs. {deliveryCharge}</span>
                </div>
                <div className="h-px bg-[#d8f3dc] my-2" />
                <div className="flex justify-between items-center">
                    <div>
                        <span className="text-[#1b4332] font-black text-xl tracking-tighter">Total Rs. {finalTotal}</span>
                    </div>
                    <div className="text-right">
                        <span className="bg-[#1b4332] text-[#ffb703] px-3 py-1 rounded-full font-black text-[9px] uppercase">{paymentMethod}</span>
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <button 
              disabled={isOrdering}
              onClick={handleConfirmOrder}
              className={`w-full py-6 rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3 ${paymentMethod === 'Online' ? 'bg-[#5C2D91] text-white' : 'bg-[#ffb703] text-[#1b4332]'}`}
            >
              {isOrdering ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  {paymentMethod === 'Online' ? 'Proceed to Payment' : 'Confirm Order'}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;