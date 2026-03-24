import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

// IMPORTANT: Import CSS here if you haven't added it to index.html
import 'leaflet/dist/leaflet.css'; 

import { Bike, Phone, MessageSquare, Navigation } from 'lucide-react';

// Fix for Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const TrackingPage = () => {
  const storePos = [27.7172, 85.3240]; 
  const customerPos = [27.6710, 85.3333]; 
  const [deliveryPos, setDeliveryPos] = useState([27.7150, 85.3250]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDeliveryPos((prev) => [Number(prev) - 0.0001, Number(prev) + 0.0001]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#f0f9f4] p-4 md:p-10">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* MAP CONTAINER - Fixed Height is Critical */}
        <div className="lg:w-2/3 bg-white rounded-[2rem] shadow-2xl overflow-hidden border-4 border-white h-[500px] lg:h-[600px] relative z-0">
          <MapContainer 
            center={deliveryPos} 
            zoom={14} 
            style={{ height: '100%', width: '100%' }} // Map fills the 600px div
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />
            <Marker position={storePos}><Popup>Store</Popup></Marker>
            <Marker position={deliveryPos}><Popup>Rider</Popup></Marker>
            <Marker position={customerPos}><Popup>Home</Popup></Marker>
            <Polyline positions={[storePos, deliveryPos, customerPos]} color="#1b4332" weight={4} />
          </MapContainer>
        </div>

        {/* SIDEBAR */}
        <div className="lg:w-1/3 bg-[#1b4332] p-8 rounded-[2rem] text-white self-start shadow-xl">
          <h2 className="text-2xl font-black mb-6">Tracking Order</h2>
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl">
              <Bike className="text-[#ffb703]" size={32} />
              <div>
                <p className="font-black text-xl text-[#ffb703]">12 Mins Away</p>
                <p className="text-sm opacity-70 italic font-medium">Suman is on his way</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-white text-[#1b4332] py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#f0f9f4] transition-all">
                <MessageSquare size={18} /> CHAT
              </button>
              <button className="bg-[#ffb703] text-[#1b4332] py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#e6a602] transition-all">
                <Phone size={18} /> CALL
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TrackingPage;