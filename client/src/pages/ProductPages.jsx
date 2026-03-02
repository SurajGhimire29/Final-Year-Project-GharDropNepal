import React, { useState } from 'react';
import { ShoppingBasket, Search, Filter, Star } from 'lucide-react';

const ProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Vegetables", "Fruits", "Dairy", "Organic", "Meat", "Bakery", "Staples"];

  const allProducts = [
    { id: 1, name: "Organic Green Apples", category: "Fruits", price: 250, image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&q=80&w=400", tag: "Fresh" },
    { id: 2, name: "Local Mustang Potatoes", category: "Vegetables", price: 120, image: "https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?auto=format&fit=crop&q=80&w=400", tag: "Local" },
    { id: 3, name: "Fresh Cauliflower", category: "Vegetables", price: 80, image: "https://images.unsplash.com/photo-1568584711075-3d021a7c3ec3?auto=format&fit=crop&q=80&w=400", tag: "Daily" },
    { id: 4, name: "Himalayan Honey", category: "Organic", price: 850, image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400", tag: "Organic" },
    { id: 5, name: "Buffalo Milk (1L)", category: "Dairy", price: 110, image: "https://images.unsplash.com/photo-1550583724-125581cc258b?auto=format&fit=crop&q=80&w=400", tag: "Pure" },
  ];

  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#f0f9f4] pb-20">
      <div className="bg-[#1b4332] pt-16 pb-24 px-10 rounded-b-[3rem]">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-8">
            FIND YOUR <span className="text-[#ffb703]">FRESH PICKS</span>
          </h1>
        
          <div className="relative max-w-2xl mx-auto flex items-center bg-white rounded-full p-2 shadow-2xl">
            <Search className="ml-4 text-gray-400" size={24} />
            <input 
              type="text" 
              placeholder="Search for organic vegetables, fruits..." 
              className="w-full p-3 outline-none rounded-full text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="bg-[#ffb703] text-[#1b4332] px-8 py-3 rounded-full font-bold hover:bg-[#ffd60a] transition-colors">
              SEARCH
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <aside className="lg:w-1/4 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#d8f3dc]">
              <div className="flex items-center gap-2 mb-4 text-[#1b4332] font-black uppercase tracking-wider">
                <Filter size={20} /> Categories
              </div>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all font-semibold ${
                      selectedCategory === cat 
                      ? "bg-[#1b4332] text-white shadow-md" 
                      : "text-gray-600 hover:bg-[#f0f9f4]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="lg:w-3/4">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[#1b4332] font-bold">Showing {filteredProducts.length} results</p>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[#d8f3dc]">
                    <div className="relative h-56 overflow-hidden">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <span className="absolute top-4 left-4 bg-[#1b4332] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">
                        {product.tag}
                      </span>
                    </div>
                    <div className="p-6">
                      <p className="text-[#40916c] text-xs font-bold uppercase mb-1">{product.category}</p>
                      <h3 className="text-[#1b4332] font-bold text-lg mb-2">{product.name}</h3>
                      <div className="flex items-center justify-between">
                        <p className="text-xl font-black text-[#1b4332]">Rs. {product.price}</p>
                        <button className="bg-[#ffb703] text-[#1b4332] p-2.5 rounded-xl hover:scale-110 transition-transform">
                          <ShoppingBasket size={22} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-[#40916c]">
                <p className="text-[#1b4332] text-xl font-bold">No products found matching "{searchTerm}"</p>
                <button onClick={() => {setSearchTerm(""); setSelectedCategory("All");}} className="mt-4 text-[#40916c] underline">Clear all filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;