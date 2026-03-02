import React from 'react';
import { ShoppingBasket, ArrowRight, Star } from 'lucide-react';

const HomePage = () => {
  const products = [
    { id: 1, name: "Organic Green Apples", price: "Rs. 250", image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&q=80&w=400", tag: "Fresh" },
    { id: 2, name: "Local Mustang Potatoes", price: "Rs. 120", image: "https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?auto=format&fit=crop&q=80&w=400", tag: "Local" },
    { id: 3, name: "Fresh Cauliflower", price: "Rs. 80", image: "https://images.unsplash.com/photo-1568584711075-3d021a7c3ec3?auto=format&fit=crop&q=80&w=400", tag: "Daily" },
    { id: 4, name: "Himalayan Honey", price: "Rs. 850", image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400", tag: "Organic" },
  ];

  return (
    <div className="bg-[#f0f9f4]">
      <section className="relative overflow-hidden bg-[#1b4332] text-white py-16 px-10 rounded-b-[3rem] shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 space-y-6">
            <span className="bg-[#ffb703] text-[#1b4332] px-4 py-1 rounded-full text-sm font-black uppercase tracking-widest">
              Dashain Special Offer
            </span>
            <h1 className="text-5xl md:text-7xl font-black leading-tight">
              Get <span className="text-[#b7e4c7]">20% OFF</span> on All Organic Items
            </h1>
            <p className="text-[#b7e4c7] text-lg opacity-90 max-w-md">
              Celebrate the festivities with healthy choices. Fast delivery straight to your ghar from the heart of Nepal.
            </p>
            <button className="bg-[#ffb703] text-[#1b4332] px-8 py-4 rounded-full font-black flex items-center gap-2 hover:bg-[#ffd60a] transition-all hover:scale-105 shadow-lg">
              SHOP NOW <ArrowRight size={20} />
            </button>
          </div>
          
          <div className="hidden md:flex relative">
            <div className="w-80 h-80 bg-[#40916c] rounded-full flex items-center justify-center animate-pulse">
                <ShoppingBasket size={150} className="text-[#b7e4c7]" />
            </div>
            <div className="absolute top-0 right-0 bg-white p-4 rounded-2xl shadow-xl text-[#1b4332] rotate-12">
               <p className="text-2xl font-black">Limited</p>
               <p className="text-xs uppercase font-bold text-center">Offer</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto py-20 px-10">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-black text-[#1b4332] uppercase tracking-tighter">Our Fresh Picks</h2>
            <div className="h-1.5 w-20 bg-[#ffb703] mt-2 rounded-full"></div>
          </div>
          <button className="text-[#1b4332] font-bold flex items-center gap-1 hover:underline">
            View All Products <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[#d8f3dc]">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <span className="absolute top-4 left-4 bg-[#1b4332] text-white text-[10px] font-black uppercase px-3 py-1 rounded-full">
                  {product.tag}
                </span>
              </div>
              
              <div className="p-6">
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className="fill-[#ffb703] text-[#ffb703]" />
                  ))}
                </div>
                <h3 className="text-[#1b4332] font-bold text-lg mb-1">{product.name}</h3>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xl font-black text-[#1b4332]">{product.price}</p>
                  <button className="bg-[#f0f9f4] text-[#1b4332] p-2 rounded-xl hover:bg-[#1b4332] hover:text-white transition-colors">
                    <ShoppingBasket size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;