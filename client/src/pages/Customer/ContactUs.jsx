import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle } from 'lucide-react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post('http://localhost:3000/contact/submit', formData);
      if (res.data.success) {
        setSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f9f4] font-sans pb-20">
      {/* Header */}
      <div className="bg-[#1b4332] text-white pt-24 pb-32 text-center rounded-b-[4rem] px-6 relative overflow-hidden shadow-lg">
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-[#2d6a4f] rounded-full blur-[100px] opacity-50 pointer-events-none"></div>
        <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter relative z-10">
          Get in <span className="text-[#ffb703]">Touch</span>
        </h1>
        <p className="mt-4 text-[#b7e4c7] font-medium text-lg max-w-2xl mx-auto relative z-10">
          Have a suggestion, complaint, or just want to say hello? We’d love to hear from you. Your feedback helps us grow.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-20 flex flex-col md:flex-row gap-8">
        
        {/* Contact Info Cards */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-[#d8f3dc] hover:scale-105 transition-transform duration-300">
            <div className="bg-[#ffb703]/20 w-16 h-16 rounded-full flex items-center justify-center text-[#ffb703] mb-6">
              <MapPin size={28} />
            </div>
            <h3 className="text-xl font-black text-[#1b4332] uppercase tracking-wide mb-2">Our Location</h3>
            <p className="text-gray-500 font-medium">Pokhara, Nepal<br/>GharDrop Headquarters</p>
          </div>

          <div className="bg-[#1b4332] p-8 rounded-[2.5rem] shadow-xl hover:scale-105 transition-transform duration-300 text-white">
            <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center text-[#ffb703] mb-6">
              <Mail size={28} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-wide mb-2">Email Us</h3>
            <p className="text-[#b7e4c7] font-medium">ghardropnepal@gmail.com<br/>support@ghardrop.com</p>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-[#d8f3dc] hover:scale-105 transition-transform duration-300">
            <div className="bg-[#ffb703]/20 w-16 h-16 rounded-full flex items-center justify-center text-[#ffb703] mb-6">
              <Phone size={28} />
            </div>
            <h3 className="text-xl font-black text-[#1b4332] uppercase tracking-wide mb-2">Call Us</h3>
            <p className="text-gray-500 font-medium">+977 9814151831<br/>Mon-Fri, 9am-6pm</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="w-full md:w-2/3 bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-[#d8f3dc]">
          <h2 className="text-3xl font-black text-[#1b4332] uppercase italic tracking-tighter mb-8">Send a Message</h2>
          
          {success && (
            <div className="mb-8 p-6 bg-[#f0f9f4] border border-[#40916c] text-[#1b4332] rounded-2xl flex items-center gap-4 animate-fadeIn">
              <CheckCircle className="text-[#40916c]" size={24} />
              <p className="font-bold">Thank you! Your message has been sent to the Admin team.</p>
            </div>
          )}

          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#40916c] ml-2">Full Name</label>
                <input 
                  type="text" name="name" required
                  value={formData.name} onChange={handleChange}
                  className="w-full bg-[#f8fdfa] border border-[#d8f3dc] p-4 rounded-2xl focus:outline-none focus:border-[#40916c] focus:ring-1 focus:ring-[#40916c] transition-all font-medium text-[#1b4332]"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#40916c] ml-2">Email Address</label>
                <input 
                  type="email" name="email" required
                  value={formData.email} onChange={handleChange}
                  className="w-full bg-[#f8fdfa] border border-[#d8f3dc] p-4 rounded-2xl focus:outline-none focus:border-[#40916c] focus:ring-1 focus:ring-[#40916c] transition-all font-medium text-[#1b4332]"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#40916c] ml-2">Subject</label>
              <input 
                type="text" name="subject" required
                value={formData.subject} onChange={handleChange}
                className="w-full bg-[#f8fdfa] border border-[#d8f3dc] p-4 rounded-2xl focus:outline-none focus:border-[#40916c] focus:ring-1 focus:ring-[#40916c] transition-all font-medium text-[#1b4332]"
                placeholder="How can we help?"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#40916c] ml-2">Message</label>
              <textarea 
                name="message" rows="5" required
                value={formData.message} onChange={handleChange}
                className="w-full bg-[#f8fdfa] border border-[#d8f3dc] p-4 rounded-2xl focus:outline-none focus:border-[#40916c] focus:ring-1 focus:ring-[#40916c] transition-all font-medium text-[#1b4332] resize-none custom-scrollbar"
                placeholder="Write your suggestion or message here..."
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full md:w-auto bg-[#ffb703] text-[#1b4332] px-10 py-4 rounded-full font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#e0a000] transition-colors shadow-lg disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={20} /> Send Message</>}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ContactUs;
