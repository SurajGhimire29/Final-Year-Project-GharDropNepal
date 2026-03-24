import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Search, 
  Edit3, 
  Trash2, 
  Plus, 
  ArrowLeft, 
  Loader2, 
  Package,
  ExternalLink,
  AlertCircle
} from "lucide-react";

const GlobalInventory = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/v1/products", {
        withCredentials: true,
      });
      // Adjust res.data.products based on your actual backend response structure
      setProducts(res.data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      try {
        await axios.delete(`http://localhost:3000/api/v1/product/${id}`, {
          withCredentials: true,
        });
        setProducts(products.filter((p) => p._id !== id));
      } catch (error) {
        alert("Failed to delete product");
      }
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f9f4]">
      <Loader2 className="animate-spin text-[#1b4332]" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0f9f4] p-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <button 
          onClick={() => navigate("/admin-dashboard")}
          className="flex items-center gap-2 text-[#40916c] font-bold mb-4 hover:text-[#1b4332] transition-colors"
        >
          <ArrowLeft size={18} /> BACK TO DASHBOARD
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-[#1b4332] uppercase tracking-tighter flex items-center gap-3">
              <Package size={36} className="text-[#ffb703]" />
              Global Inventory
            </h1>
            <p className="text-[#40916c] font-medium">Manage all active product listings across GharDrop Nepal.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="Search products or categories..."
                className="pl-12 pr-6 py-3 rounded-2xl border border-[#d8f3dc] focus:outline-none focus:border-[#40916c] w-64 md:w-80 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => navigate("/admin/product/new")}
              className="bg-[#1b4332] text-white p-3 rounded-2xl hover:bg-[#2d6a4f] transition-all shadow-lg"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="max-w-7xl mx-auto bg-white rounded-[2.5rem] shadow-sm border border-[#d8f3dc] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fcfdfc] border-b border-[#f0f9f4]">
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Details</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock Status</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f9f4]">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-[#f0f9f4]/30 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-gray-50 overflow-hidden border border-[#d8f3dc]">
                        <img 
                          src={product.images?.[0]?.url || "https://via.placeholder.com/100"} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-black text-[#1b4332]">{product.name}</p>
                        <p className="text-xs text-gray-400">ID: {product._id.slice(-6).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="px-3 py-1 bg-[#f0f9f4] text-[#1b4332] rounded-full text-xs font-bold uppercase">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-6">
                    {product.stock < 10 ? (
                      <div className="flex items-center gap-1 text-orange-600 font-bold text-xs">
                        <AlertCircle size={14} /> Low Stock: {product.stock}
                      </div>
                    ) : (
                      <div className="text-[#40916c] font-bold text-xs">
                        In Stock: {product.stock}
                      </div>
                    )}
                  </td>
                  <td className="p-6 font-black text-[#1b4332]">
                    Rs. {product.price}
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => navigate(`/admin/product/${product._id}`)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                        title="Edit Product"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="p-20 text-center">
            <Package size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 font-bold">No products found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalInventory;