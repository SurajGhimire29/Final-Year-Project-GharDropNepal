import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bell, Trash2, CheckCircle, ArrowLeft, Loader2, MailOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API_URL = "http://localhost:3000";

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/notifications/me`, {
        withCredentials: true,
      });
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Fetch Notifications Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      const { data } = await axios.put(`${API_URL}/notification/${id}/read`, {}, {
        withCredentials: true,
      });
      if (data.success) {
        setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      }
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  const deleteNotification = async (id) => {
    try {
      const { data } = await axios.delete(`${API_URL}/notification/${id}`, {
        withCredentials: true,
      });
      if (data.success) {
        setNotifications(notifications.filter(n => n._id !== id));
        toast.success("Notification deleted");
      }
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f9f4] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#1b4332]" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f9f4] pb-20 font-sans">
      <div className="bg-[#1b4332] pt-20 pb-28 px-6 rounded-b-[3.5rem] shadow-xl relative overflow-hidden text-center">
        <button onClick={() => navigate(-1)} className="absolute top-8 left-8 text-white/60 hover:text-white transition-all flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]">
            <ArrowLeft size={16} /> Back
        </button>
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter relative z-10">
          Your <span className="text-[#ffb703]">Notifications</span>
        </h1>
        <p className="text-[#b7e4c7] font-medium mt-2 opacity-80 uppercase tracking-widest text-[10px]">Stay updated with your orders</p>
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-12 relative z-20">
        {notifications.length === 0 ? (
          <div className="bg-white p-16 rounded-[3rem] text-center shadow-xl border border-[#d8f3dc]">
            <Bell className="mx-auto text-gray-200 mb-6" size={80} />
            <h3 className="text-2xl font-black text-[#1b4332] uppercase mb-2">No alerts yet</h3>
            <p className="text-gray-500 font-medium">When you get updates on your orders, they will appear here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
              <div 
                key={n._id} 
                className={`bg-white p-6 rounded-[2rem] shadow-lg border transition-all duration-300 flex items-start gap-5 ${n.isRead ? 'border-[#d8f3dc] opacity-70' : 'border-[#40916c] border-l-8 ring-4 ring-[#40916c]/5'}`}
              >
                <div className={`p-4 rounded-2xl ${n.isRead ? 'bg-gray-100 text-gray-400' : 'bg-[#f0f9f4] text-[#1b4332]'}`}>
                  {n.isRead ? <MailOpen size={24}/> : <Bell size={24}/>}
                </div>
                
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-lg font-black uppercase tracking-tight ${n.isRead ? 'text-gray-400' : 'text-[#1b4332]'}`}>{n.title}</h4>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-600 font-medium leading-relaxed text-sm mb-4">{n.message}</p>
                  
                  <div className="flex gap-4">
                    {!n.isRead && (
                      <button onClick={() => markAsRead(n._id)} className="text-[10px] font-black uppercase tracking-widest text-[#40916c] hover:underline flex items-center gap-1">
                        <CheckCircle size={12}/> Mark as read
                      </button>
                    )}
                    <button onClick={() => deleteNotification(n._id)} className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:underline flex items-center gap-1">
                      <Trash2 size={12}/> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
