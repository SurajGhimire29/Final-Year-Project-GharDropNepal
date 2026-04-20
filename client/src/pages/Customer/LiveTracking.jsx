import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Bike, Loader2, Phone,
  Package, ArrowLeft, User, CheckCircle, Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';

// Leaflet Imports
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- CUSTOM MAP ICONS ---
const riderIcon = L.divIcon({
  html: `<div style="background-color: #1b4332; padding: 8px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffb703" stroke-width="3">
            <circle cx="18.5" cy="17.5" r="3.5"/>
            <circle cx="5.5" cy="17.5" r="3.5"/>
            <path d="M12 9l2 4H9l1.2-2.4M12 9V4a1 1 0 0 1 1-1h2"/>
          </svg>
        </div>`,
  className: "",
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

const customerIcon = L.divIcon({
  html: `<div style="background-color: #ffb703; padding: 8px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1b4332" stroke-width="3">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>`,
  className: "",
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

// --- AUTO FIT BOUNDS ---
const MapBoundsHandler = ({ riderLoc, orderLoc }) => {
  const map = useMap();

  useEffect(() => {
    if (riderLoc && orderLoc) {
      const bounds = L.latLngBounds([riderLoc, orderLoc]);
      map.fitBounds(bounds, { padding: [70, 70], maxZoom: 16 });
    }
  }, [riderLoc, orderLoc, map]);

  return null;
};

// --- RECENTER ON RIDER MOVE ---
const RecenterMap = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom(), { animate: true });
    }
  }, [position, map]);

  return null;
};

// Socket
const socket = io("http://localhost:3000");

const LiveTracking = () => {
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDelivered, setIsDelivered] = useState(false);
  const [riderLiveLocation, setRiderLiveLocation] = useState(null);
  const [orderDestination, setOrderDestination] = useState(null);

  const navigate = useNavigate();
  const API_URL = 'http://localhost:3000';

  useEffect(() => {
    const fetchActiveOrder = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/user/active-order`, {
          withCredentials: true
        });

        if (data.success && data.order) {
          setActiveOrder(data.order);
          socket.emit('joinOrder', data.order._id);

          // Destination
          const dest = data.order.shippingAddress?.coordinates;
          if (dest?.lat && dest?.lng) {
            setOrderDestination([+dest.lat, +dest.lng]);
          }

          // Rider initial location
          const rLoc = data.order.deliveryBoy?.currentLocation;
          if (rLoc?.lat && rLoc?.lng) {
            setRiderLiveLocation([+rLoc.lat, +rLoc.lng]);
          }
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveOrder();

    // --- SOCKET LISTENERS ---

    socket.on('orderStatusUpdated', (updatedOrder) => {
      setActiveOrder(updatedOrder);

      const rLoc = updatedOrder.deliveryBoy?.currentLocation;
      if (rLoc?.lat && rLoc?.lng) {
        setRiderLiveLocation([+rLoc.lat, +rLoc.lng]);
      }

      toast.success(`Order is now ${updatedOrder.orderStatus}`);
    });

    socket.on('riderLocationUpdated', (location) => {

      if (location?.lat && location?.lng) {
        setRiderLiveLocation([+location.lat, +location.lng]);
      }
    });

    socket.on('orderFinished', (data) => {
      if (data.status === 'Delivered') {
        setIsDelivered(true);
        setActiveOrder(null);
        toast.success("GharDrop Delivered!");
      }
    });

    return () => {
      socket.off('orderStatusUpdated');
      socket.off('riderLocationUpdated');
      socket.off('orderFinished');
    };
  }, []);

  // --- UI STATES ---

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f0f9f4]">
        <Loader2 className="animate-spin text-[#1b4332]" size={40} />
      </div>
    );
  }

  if (isDelivered) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center">
        <CheckCircle size={60} className="text-green-600 mb-4" />
        <h1 className="text-2xl font-bold">Delivered!</h1>
        <button onClick={() => navigate('/')} className="mt-4">
          Back Home
        </button>
      </div>
    );
  }

  if (!activeOrder) {
    return <div className="text-center mt-10">No Active Orders</div>;
  }

  // --- MAIN UI ---

  return (
    <div className="max-w-xl mx-auto p-4">

      <button onClick={() => navigate(-1)}>
        <ArrowLeft /> Back
      </button>

      <h1 className="text-xl font-bold my-4">
        {activeOrder.orderStatus}
      </h1>

      <div className="h-[400px] rounded-xl overflow-hidden">
        {orderDestination ? (
          <MapContainer
            center={orderDestination}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* CUSTOMER */}
            <Marker position={orderDestination} icon={customerIcon}>
              <Popup>Your Location</Popup>
            </Marker>

            {/* RIDER */}
            {riderLiveLocation && (
              <Marker
                key={riderLiveLocation.join(",")} // 🔥 IMPORTANT FIX
                position={riderLiveLocation}
                icon={riderIcon}
              >
                <Popup>Rider</Popup>
              </Marker>
            )}

            <MapBoundsHandler
              riderLoc={riderLiveLocation}
              orderLoc={orderDestination}
            />

            <RecenterMap position={riderLiveLocation} />

          </MapContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            Connecting to GPS...
          </div>
        )}
      </div>

      {/* Rider Info */}
      <div className="mt-4 flex items-center justify-between">
        <div>
          <p>Delivery Boy</p>
          <h3>{activeOrder.deliveryBoy?.fullName || "Assigning..."}</h3>
        </div>

        {activeOrder.deliveryBoy?.phoneNumber && (
          <a href={`tel:${activeOrder.deliveryBoy.phoneNumber}`}>
            <Phone />
          </a>
        )}
      </div>

    </div>
  );
};

export default LiveTracking;