import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Phone, Navigation, ArrowLeft, CheckCircle2, Loader2, Bike } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';

// Leaflet & Routing Imports
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Fix for default Leaflet marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// --- CUSTOM ICONS ---
const riderIcon = L.divIcon({
    html: `<div style="background-color: #1b4332; padding: 8px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 9l2 4H9l1.2-2.4"/><path d="M12 9V4a1 1 0 0 1 1-1h2"/><path d="M15 9l-1-1a2 2 0 0 0-3.2 0l-1.1 1.1"/></svg>
           </div>`,
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 18]
});

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- HELPER COMPONENTS ---

// 1. Moving Blue Line (Routing)
const RoutingMachine = ({ riderCoords, customerCoords }) => {
    const map = useMap();

    useEffect(() => {
        if (!map || !riderCoords || !customerCoords) return;

        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(riderCoords[0], riderCoords[1]),
                L.latLng(customerCoords[0], customerCoords[1])
            ],
            lineOptions: {
                styles: [{ color: '#3b82f6', weight: 6, opacity: 0.8 }]
            },
            show: false, // Hides the instruction panel
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: false,
            createMarker: () => null, // We use our own markers
        }).addTo(map);

        return () => map.removeControl(routingControl);
    }, [map, riderCoords, customerCoords]);

    return null;
};

// 2. Camera Auto-Follow
const MapViewUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 16, { duration: 1.5 });
        }
    }, [center, map]);
    return null;
};

// Initialize Socket
const socket = io("http://localhost:3000"); 

const DeliveryOrderProcess = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userCoords, setUserCoords] = useState([28.2095, 83.9856]); 
    const [riderLiveCoords, setRiderLiveCoords] = useState(null);

    const API_URL = "http://localhost:3000"; 

    // 1. Socket & Live GPS Watcher
    useEffect(() => {
        if (id) {
            socket.emit('joinOrder', id);

            const watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setRiderLiveCoords([latitude, longitude]);
                    
                    socket.emit('updateRiderLocation', { 
                        orderId: id, 
                        location: { lat: latitude, lng: longitude } 
                    });

                    axios.put(`${API_URL}/location`, { lat: latitude, lng: longitude }, { withCredentials: true })
                        .catch(() => {}); // Silent update
                },
                (err) => {
                    toast.error("GPS access denied. Live tracking disabled.");
                },
                { enableHighAccuracy: true, distanceFilter: 5 } // Updates every 5 meters
            );

            return () => {
                navigator.geolocation.clearWatch(watchId);
                socket.off('riderLocationUpdated');
            };
        }
    }, [id]);

    // 2. Fetch Order Details
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`${API_URL}/delivery/order-details/${id}`, { withCredentials: true });
                
                if (data.success && data.order) {
                    setOrder(data.order);
                    const savedCoords = data.order.shippingAddress?.coordinates;
                    
                    // Handle both Array and Object formats from DB
                    if (Array.isArray(savedCoords)) {
                        setUserCoords([savedCoords[0], savedCoords[1]]);
                    } else if (savedCoords?.lat && savedCoords?.lng) {
                        setUserCoords([parseFloat(savedCoords.lat), parseFloat(savedCoords.lng)]);
                    }
                }
            } catch (err) {
                toast.error("Failed to load delivery details");
                navigate('/delivery/my-orders');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id, navigate]);

    const openInGoogleMaps = () => {
        const [destLat, destLng] = userCoords;
        const [startLat, startLng] = riderLiveCoords || userCoords;
        const url = `https://www.google.com/maps/dir/?api=1&origin=${startLat},${startLng}&destination=${destLat},${destLng}&travelmode=driving`;
        window.open(url, '_blank');
    };

    const handleMarkDelivered = async () => {
        try {
            const { data } = await axios.put(`${API_URL}/delivery/order/${id}`, 
            { status: 'Delivered' }, 
            { withCredentials: true });
            
            if(data.success) {
                toast.success("Order Delivered!");
                navigate('/delivery/my-orders');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Status update failed");
        }
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-[#f0f9f4]">
            <Loader2 className="animate-spin text-[#1b4332]" size={40} />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f0f9f4] p-4 md:p-8 font-sans">
            <div className="max-w-2xl mx-auto">
                <button 
                    onClick={() => navigate(-1)} 
                    className="mb-6 flex items-center gap-2 font-black uppercase text-[10px] text-[#1b4332] bg-white px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all"
                >
                    <ArrowLeft size={14} /> Back to Dashboard
                </button>

                <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-[#d8f3dc]">
                    <div className="bg-[#1b4332] p-8 text-white relative">
                        <div className="relative z-10">
                            <span className="bg-[#ffb703] text-[#1b4332] text-[9px] font-black px-2 py-0.5 rounded uppercase mb-2 inline-block">
                                {order?.shippingStatus || "Active Delivery"}
                            </span>
                            <h2 className="text-3xl font-black uppercase leading-tight tracking-tight">On the Way</h2>
                            <p className="text-[#95d5b2] font-bold uppercase text-xs mt-1">
                                To: {order?.user?.fullName || "Valued Customer"}
                            </p>
                        </div>
                        <Bike className="absolute right-6 top-1/2 -translate-y-1/2 w-24 h-24 text-white/5 rotate-[-15deg]" />
                    </div>

                    <div className="p-6 md:p-10 space-y-8">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-black text-[#1b4332] uppercase text-sm flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Live Delivery Map
                                </h3>
                                {riderLiveCoords && (
                                    <span className="text-[9px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase">GPS Active</span>
                                )}
                            </div>
                            
                            <div className="h-96 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl relative z-0">
                                <MapContainer center={userCoords} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    
                                    {/* Blue Route Line */}
                                    {riderLiveCoords && (
                                        <RoutingMachine riderCoords={riderLiveCoords} customerCoords={userCoords} />
                                    )}

                                    {/* Markers */}
                                    <Marker position={userCoords}><Popup>Customer</Popup></Marker>
                                    {riderLiveCoords && (
                                        <Marker position={riderLiveCoords} icon={riderIcon}><Popup>You</Popup></Marker>
                                    )}
                                    
                                    <MapViewUpdater center={riderLiveCoords || userCoords} />
                                </MapContainer>

                                <button 
                                    onClick={openInGoogleMaps}
                                    className="absolute bottom-6 right-6 z-[1000] bg-[#1b4332] text-[#ffb703] px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3 shadow-2xl hover:bg-[#081c15] transition-all"
                                >
                                    <Navigation size={18} fill="#ffb703" /> Get Directions
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="bg-[#f8fdfa] p-6 rounded-3xl border border-[#d8f3dc] flex items-center justify-between">
                                 <div>
                                     <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Customer Phone</p>
                                     <p className="text-xl font-black text-[#1b4332]">{order?.shippingAddress?.phoneNumber || "N/A"}</p>
                                 </div>
                                 <a href={`tel:${order?.shippingAddress?.phoneNumber}`} className="w-12 h-12 bg-green-500 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-green-600">
                                    <Phone size={20} fill="white" />
                                 </a>
                             </div>

                             <button onClick={handleMarkDelivered} className="bg-[#1b4332] text-white p-6 rounded-3xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-[#2d6a4f] transition-all flex items-center justify-center gap-3">
                                <CheckCircle2 size={20} /> Finish Delivery
                             </button>
                        </div>

                        <div className="bg-[#f0f9f4] p-6 rounded-3xl border-l-4 border-[#1b4332]">
                            <p className="text-[9px] font-black text-[#2d6a4f] uppercase mb-1">Drop-off Point</p>
                            <p className="text-sm font-bold text-[#1b4332] leading-relaxed">
                                {order?.shippingAddress?.addressLine}
                            </p>
                            <p className="text-xs font-bold text-[#52b788] uppercase mt-1">
                                {order?.shippingAddress?.landmark ? `Landmark: ${order.shippingAddress.landmark}` : ""}
                            </p>
                            <p className="text-xs font-bold text-[#52b788] uppercase">
                                {order?.shippingAddress?.city || "Pokhara"}, Nepal
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryOrderProcess;