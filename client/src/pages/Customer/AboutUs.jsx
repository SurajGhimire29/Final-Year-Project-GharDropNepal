import React from 'react';
import { Leaf, Users, ShieldCheck, Target, Award, ArrowRight, MapPin, Sprout, ShoppingBasket } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from "../../assets/image.png";
import ownerPhoto from "../../assets/me.jpg";

const AboutUs = () => {
  return (
    <div className="bg-[#f0f9f4] min-h-screen font-sans overflow-x-hidden text-[#1b4332]">
      
      {/* --- VIBRANT HERO SECTION --- */}
      <section className="relative bg-[#1b4332] rounded-b-[4rem] md:rounded-b-[6rem] overflow-hidden shadow-lg py-24 md:py-32 px-6">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#2d6a4f] rounded-full blur-[100px] opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#ffb703] rounded-full blur-[120px] opacity-10 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 flex flex-col items-center">
            <img src={logo} alt="GharDrop Logo" className="w-48 brightness-0 invert hover:scale-105 transition-transform" />
            
            <div className="inline-flex items-center gap-2 bg-[#ffb703] text-[#1b4332] px-5 py-2 rounded-full text-xs font-black uppercase tracking-[0.3em]">
                <Sprout size={16} /> Local. Organic. Direct.
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black text-white uppercase italic tracking-tighter leading-[0.9]">
                The Soul of <br/> Nepal’s <span className="text-[#ffb703] not-italic">Harvest.</span>
            </h1>
            <p className="text-white/70 text-lg md:text-2xl max-w-2xl font-medium leading-relaxed">
                GharDrop bridges the gap between hardworking local farmers and your dinner table, delivering pure, traceable freshness.
            </p>
        </div>
      </section>

      {/* --- FOUNDER SECTION --- */}
      <section className="max-w-7xl mx-auto py-24 px-6 mt-10">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-5/12 relative">
            <div className="absolute -bottom-6 -right-6 w-32 h-32 border-8 border-[#ffb703] rounded-[3rem] -z-10 hidden md:block opacity-50"></div>
            
            <div className="aspect-[4/5] bg-white rounded-[4rem] relative overflow-hidden shadow-2xl border-4 border-[#ffb703]">
              <img 
                src={ownerPhoto} 
                alt="Suraj Ghimire" 
                className="w-full h-full object-cover transition-all duration-700 transform hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#081c15] via-transparent to-transparent opacity-80"></div>
              
              <div className="absolute bottom-10 left-10 text-white">
                <p className="text-[#ffb703] font-black uppercase tracking-[0.3em] text-[10px] mb-1">Founder & Visionary</p>
                <h3 className="text-4xl font-black uppercase italic tracking-tighter">Suraj Ghimire</h3>
                <div className="flex items-center gap-2 mt-2">
                    <MapPin size={12} className="text-[#ffb703]" />
                    <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Kathmandu, Nepal</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-7/12 space-y-8">
            <h2 className="text-4xl md:text-6xl font-black text-[#1b4332] uppercase italic tracking-tighter leading-none">
              A Voice for <br/> <span className="text-[#40916c]">Nepali Agriculture</span>
            </h2>
            <p className="text-gray-600 text-lg font-medium leading-relaxed">
              "Growing up surrounded by the unmatched quality of Nepal’s local produce, I also saw the profound struggle of farmers getting their goods to urban markets without compromising their soul."
            </p>
            <div className="bg-white p-8 rounded-[3rem] border-l-8 border-[#ffb703] shadow-inner">
                <p className="text-[#1b4332] text-xl font-bold italic leading-relaxed">
                  "GharDrop is our answer. It's not just an e-commerce platform; it's a pledge to support our local families and return healthy, traceable food to Nepalese homes."
                </p>
            </div>
            <p className="text-[#1b4332] font-black uppercase tracking-widest text-sm ml-4">— Suraj Ghimire</p>
          </div>
        </div>
      </section>

      {/* --- CORE VALUES --- */}
      <section className="bg-white py-24 rounded-[4rem] md:rounded-[6rem] shadow-xl border-t border-[#e8f5e9]">
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <span className="text-[#ffb703] font-black uppercase tracking-[0.4em] text-[10px]">What guides us</span>
          <h2 className="text-4xl md:text-6xl font-black text-[#1b4332] uppercase italic tracking-tighter mt-2">Our <span className="text-[#ffb703]">Core</span> Pillars</h2>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              icon: <Leaf className="text-[#ffb703]" size={32} />, 
              title: "Ethical Sourcing", 
              desc: "We exclusively partner with vendors dedicated to traditional, chemical-free production methods." 
            },
            { 
              icon: <Target className="text-[#ffb703]" size={32} />, 
              title: "Direct Impact", 
              desc: "Higher pay for farmers, lower prices for you. We remove middlemen to empower the community." 
            },
            { 
              icon: <Award className="text-[#ffb703]" size={32} />, 
              title: "Quality First", 
              desc: "Every product undergoes rigorous supervision to ensure it meets our premium freshness standards." 
            }
          ].map((val, i) => (
            <div key={i} className="bg-[#f0f9f4] p-10 rounded-[3rem] border border-[#d8f3dc] group hover:bg-[#1b4332] hover:-translate-y-3 transition-all duration-500 shadow-sm hover:shadow-2xl">
              <div className="mb-6 group-hover:scale-110 transition-transform">{val.icon}</div>
              <h4 className="text-xl font-black text-[#1b4332] uppercase mb-4 group-hover:text-white transition-colors">{val.title}</h4>
              <p className="text-gray-500 font-medium text-sm leading-relaxed group-hover:text-white/70 transition-colors">{val.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="bg-[#ffb703] rounded-[4rem] p-12 md:p-20 text-center relative overflow-hidden group shadow-2xl">
          <div className="absolute -top-10 -right-10 p-10 opacity-10 group-hover:scale-110 transition-transform">
            <ShoppingBasket size={200} className="text-[#1b4332]" />
          </div>
          
          <h2 className="text-4xl md:text-7xl font-black text-[#1b4332] uppercase italic tracking-tighter leading-none mb-8 relative z-10">
            Taste the Himalayan <br/> <span className="underline decoration-[#1b4332] underline-offset-8">Difference.</span>
          </h2>
          
          <Link to="/products" className="inline-flex items-center gap-4 bg-[#1b4332] text-white px-12 py-6 rounded-full font-black uppercase tracking-widest text-sm hover:bg-black transition-all shadow-xl active:scale-95 relative z-10">
            Start Shopping <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;