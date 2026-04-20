import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShoppingBag, Calendar, MapPin, 
  CheckCircle2, Clock, Package, 
  ChevronRight, ArrowLeft, Loader2,
  History as HistoryIcon, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

const History = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:3000';

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_URL}/orders/my-orders`, { 
          withCredentials: true 
        });
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyOrders();
  }, []);

  // Separate Active vs Past
  const activeOrders = orders.filter(o => !['Delivered', 'Cancelled'].includes(o.shippingStatus));
  const pastOrders = orders.filter(o => ['Delivered', 'Cancelled'].includes(o.shippingStatus));

  const OrderCard = ({ order, isPast }) => (
    <div className={`bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm mb-6 ${isPast ? 'opacity-80 grayscale-[0.3]' : 'border-l-4 border-l-[#40916c]'}`}>
      <div className="px-6 py-4 bg-gray-50/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            {new Date(order.createdAt).toLocaleDateString('en-NP')}
          </span>
        </div>
        <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border 
          ${order.shippingStatus === 'Delivered' ? 'bg-green-50 text-green-600 border-green-100' : 
            order.shippingStatus === 'Cancelled' ? 'bg-red-50 text-red-600 border-red-100' : 
            'bg-orange-50 text-orange-600 border-orange-100'}`}>
          {order.shippingStatus}
        </span>
      </div>

      <div className="p-6">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-[#1b4332] uppercase">{item.quantity}x {item.name}</span>
            <span className="text-sm font-black text-gray-400">Rs.{item.price * item.quantity}</span>
          </div>
        ))}
        <div className="mt-4 pt-4 border-t border-dashed border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black text-gray-300 uppercase">Total Spent</p>
            <p className="text-xl font-black text-[#1b4332]">Rs. {order.totalAmount}</p>
          </div>
          <Link 
            to={`/order/${order._id}`}
            className="bg-[#f0f9f4] text-[#40916c] p-3 rounded-xl hover:bg-[#40916c] hover:text-white transition-all"
          >
            <ChevronRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#f8fdfa]">
      <Loader2 className="animate-spin text-[#40916c]" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fdfa] pb-10">
      {/* Navbar */}
      <div className="bg-white px-6 py-6 border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link to="/"><ArrowLeft size={20} /></Link>
          <h1 className="text-xl font-black text-[#1b4332] uppercase italic">My GharDrop Activity</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        
        {/* Section 1: Active Tracking */}
        {activeOrders.length > 0 && (
          <div className="mb-12">
            <h2 className="text-[10px] font-black text-[#40916c] uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <Zap size={14} fill="currentColor"/> Live Tracking
            </h2>
            {activeOrders.map(order => <OrderCard key={order._id} order={order} isPast={false} />)}
          </div>
        )}

        {/* Section 2: Past Purchases */}
        <div>
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
            <HistoryIcon size={14}/> Past Purchases
          </h2>
          {pastOrders.length > 0 ? (
            pastOrders.map(order => <OrderCard key={order._id} order={order} isPast={true} />)
          ) : (
            <div className="bg-white p-10 rounded-[2rem] text-center border-2 border-dashed border-gray-100">
              <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">No previous history yet</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default History;