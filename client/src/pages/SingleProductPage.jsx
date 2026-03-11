import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBasket, ArrowLeft, Star, Truck, ShieldCheck } from 'lucide-react';

const SingleProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // In a real app, you'd fetch this from your backend API
  // For now, we use the same dummy data
  const allProducts = [
    { id: 1, name: "Organic Green Apples", category: "Fruits", price: 250, desc: "Crisp, juicy, and packed with nutrients. Our organic green apples are sourced directly from local orchards.", image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&q=80&w=400", tag: "Fresh" },
    { id: 2, name: "Local Mustang Potatoes", category: "Vegetables", price: 120, desc: "Famous Mustang potatoes known for their unique taste and texture. Perfect for traditional Nepali dishes.", image: "https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?auto=format&fit=crop&q=80&w=400", tag: "Local" },
    // ... add descriptions to other products too
  ];

  const product = allProducts.find(p => p.id === parseInt(id));

  if (!product) return <div className="text-center py-20">Product not found!</div>;

  return (
    <div className="min-h-screen bg-[#f0f9f4] pb-12">
      {/* Header / Back Button */}
      <div className="bg-[#1b4332] p-6 pt-12">
        <div className="max-w-7xl mx-auto">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-white hover:text-[#ffb703] transition-colors font-bold"
          >
            <ArrowLeft size={20} /> BACK TO SHOP
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-[#d8f3dc]">
          <div className="flex flex-col md:flex-row">
            
            {/* Image Section */}
            <div className="md:w-1/2 p-8">
              <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-inner bg-[#f8fdfa]">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-6 left-6 bg-[#ffb703] text-[#1b4332] font-black px-4 py-2 rounded-full text-sm shadow-lg">
                  {product.tag}
                </span>
              </div>
            </div>

            {/* Details Section */}
            <div className="md:w-1/2 p-10 flex flex-col justify-center">
              <p className="text-[#40916c] font-black uppercase tracking-widest text-sm mb-2">
                {product.category}
              </p>
              <h1 className="text-4xl font-black text-[#1b4332] mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-2 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="fill-[#ffb703] text-[#ffb703]" />
                ))}
                <span className="text-gray-400 font-semibold ml-2">(4.8 / 5.0 Rating)</span>
              </div>

              <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                {product.desc || "Experience the finest quality produce delivered straight from the farm to your doorstep. Fresh, organic, and locally sourced for the best taste."}
              </p>

              <div className="flex items-end gap-4 mb-8">
                <p className="text-4xl font-black text-[#1b4332]">Rs. {product.price}</p>
                <p className="text-[#40916c] font-bold mb-1 line-through opacity-50">Rs. {product.price + 50}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button className="flex-1 bg-[#1b4332] text-white py-4 rounded-2xl font-black text-lg hover:bg-[#2d6a4f] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95">
                  <ShoppingBasket size={24} /> ADD TO BASKET
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 mt-10 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-3 text-gray-600">
                  <Truck className="text-[#40916c]" />
                  <span className="text-sm font-bold">Fast Delivery</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <ShieldCheck className="text-[#40916c]" />
                  <span className="text-sm font-bold">100% Organic</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleProductPage;