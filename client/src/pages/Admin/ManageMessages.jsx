import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Mail, CheckCircle, Circle, Trash2, Loader2, ArrowLeft, MessageSquare } from 'lucide-react';

const ManageMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMessages = async () => {
    try {
      const res = await axios.get('http://localhost:3000/admin/messages', { withCredentials: true });
      if (res.data.success) {
        setMessages(res.data.messages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const toggleReadStatus = async (id) => {
    try {
      const res = await axios.put(`http://localhost:3000/admin/message/${id}/read`, {}, { withCredentials: true });
      if (res.data.success) {
        setMessages(messages.map(msg => 
          msg._id === id ? { ...msg, isRead: res.data.data.isRead } : msg
        ));
      }
    } catch (error) {
      console.error("Error toggling read status:", error);
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      const res = await axios.delete(`http://localhost:3000/admin/message/${id}`, { withCredentials: true });
      if (res.data.success) {
        setMessages(messages.filter(msg => msg._id !== id));
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0f9f4]">
        <Loader2 className="animate-spin text-[#1b4332]" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f9f4] p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin-dashboard')} className="p-3 bg-white rounded-full shadow-sm hover:scale-105 transition-transform text-[#1b4332]">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h2 className="text-3xl font-black text-[#1b4332] uppercase tracking-tight">Customer Feedback</h2>
              <p className="text-[#40916c] font-semibold italic uppercase text-[10px] tracking-widest">Manage Suggestions & Inquiries</p>
            </div>
          </div>
          <div className="bg-[#1b4332] text-[#ffb703] px-6 py-3 rounded-full font-black uppercase text-sm flex items-center gap-2 shadow-lg">
            <MessageSquare size={18} /> {messages.length} Total
          </div>
        </header>

        {messages.length === 0 ? (
          <div className="bg-white p-16 rounded-[3rem] text-center shadow-sm border border-[#d8f3dc]">
            <Mail className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-2xl font-black text-[#1b4332] uppercase mb-2">No messages yet</h3>
            <p className="text-gray-500 font-medium">When customers send suggestions or complaints, they will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {messages.map((msg) => (
              <div 
                key={msg._id} 
                className={`p-6 md:p-8 rounded-[2rem] border transition-all duration-300 shadow-sm flex flex-col md:flex-row gap-6 ${
                  msg.isRead ? 'bg-white border-[#d8f3dc] opacity-70' : 'bg-[#f8fdfa] border-[#40916c] border-l-8 scale-[1.01] shadow-md'
                }`}
              >
                <div className="flex-grow space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    {msg.isRead ? (
                      <CheckCircle className="text-gray-400" size={20} />
                    ) : (
                      <Circle className="text-[#ffb703] fill-[#ffb703] animate-pulse" size={20} />
                    )}
                    <h3 className="text-xl font-black text-[#1b4332] uppercase">{msg.subject}</h3>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-[#40916c]">
                    <span className="bg-[#e8f5e9] px-3 py-1 rounded-full">{msg.name}</span>
                    <span>{msg.email}</span>
                    <span>• {new Date(msg.createdAt).toLocaleDateString()}</span>
                  </div>

                  <p className="text-gray-700 font-medium leading-relaxed bg-white p-6 rounded-2xl border border-[#e8f5e9]">
                    {msg.message}
                  </p>
                </div>

                <div className="flex md:flex-col justify-end gap-3 min-w-[140px]">
                  <button 
                    onClick={() => toggleReadStatus(msg._id)}
                    className={`px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
                      msg.isRead 
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                        : 'bg-[#1b4332] text-white hover:bg-[#2d6a4f]'
                    }`}
                  >
                    {msg.isRead ? 'Mark Unread' : 'Mark as Read'}
                  </button>
                  <button 
                    onClick={() => deleteMessage(msg._id)}
                    className="px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageMessages;
