import React, { useState } from 'react';
import { ImagePlus, Package, Save, ArrowLeft, Percent } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    unit: 'kg',
    category: 'Vegetables',
    stock: '',
    tag: 'Fresh',
    isFestivalOffer: false,
    discountPercentage: 0 // New Field
  });
  
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Helper to calculate preview price on the fly
  const calculateDiscountedPrice = () => {
    const originalPrice = parseFloat(formData.price) || 0;
    const percentage = parseFloat(formData.discountPercentage) || 0;
    return (originalPrice - (originalPrice * (percentage / 100))).toFixed(2);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0]; 
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const data = new FormData();
    
    // Append all fields from state
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    
    if (image) {
        data.append('image', image);
    } else {
        alert("Please select a product image");
        setLoading(false);
        return;
    }

    try {
      // Ensure the URL matches your backend port (3000 or 5000)
      const response = await axios.post('http://localhost:3000/addProduct', data, {
        withCredentials: true,
      });
      
      if (response.data.success) {
        alert("Product Added Successfully!");
        navigate(-1); 
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Error adding product";
      console.error("Upload Error:", errorMsg);
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f9f4] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-[#1b4332] font-bold mb-6 hover:gap-3 transition-all"
        >
          <ArrowLeft size={20} /> BACK TO DASHBOARD
        </button>

        <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-[#b7e4c7]">
          <div className="bg-[#1b4332] p-8 text-white">
            <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Package className="text-[#ffb703]" size={32} />
              List New Product
            </h1>
            <p className="text-[#b7e4c7] font-medium mt-1">Add fresh items to your storefront.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Image Upload Section */}
              <div className="lg:col-span-1">
                <label className="text-xs font-black text-[#1b4332] uppercase mb-3 block ml-2">Product Photo</label>
                <div className="aspect-square border-4 border-dashed border-[#d8f3dc] rounded-[2.5rem] p-4 hover:border-[#40916c] transition-colors bg-[#f0f9f4] relative flex flex-col items-center justify-center overflow-hidden">
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-3xl" />
                  ) : (
                    <div className="text-center">
                      <ImagePlus size={40} className="mx-auto text-[#40916c] mb-2" />
                      <p className="text-[#1b4332] text-sm font-bold">Select Image</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    onChange={handleImageChange} 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    required={!preview} 
                    accept="image/*"
                  />
                </div>
              </div>

              {/* Form Fields Section */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-[#1b4332] uppercase ml-2">Product Name</label>
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Local Organic Apple" className="w-full px-6 py-4 rounded-2xl bg-[#f0f9f4] border-none focus:ring-2 focus:ring-[#ffb703] font-medium" required />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-[#1b4332] uppercase ml-2">Price (Rs.)</label>
                    <input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="0.00" className="w-full px-6 py-4 rounded-2xl bg-[#f0f9f4] border-none focus:ring-2 focus:ring-[#ffb703] font-medium" required />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-[#1b4332] uppercase ml-2">Category</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full px-6 py-4 rounded-2xl bg-[#f0f9f4] border-none focus:ring-2 focus:ring-[#ffb703] font-bold">
                      {['Vegetables', 'Fruits', 'Dairy', 'Organic', 'Meat', 'Bakery', 'Staples'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-[#1b4332] uppercase ml-2">Unit</label>
                    <select name="unit" value={formData.unit} onChange={handleChange} className="w-full px-6 py-4 rounded-2xl bg-[#f0f9f4] border-none focus:ring-2 focus:ring-[#ffb703] font-bold">
                      {['kg', 'gram', 'piece', 'pkt', 'litre'].map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-[#1b4332] uppercase ml-2">Available Stock</label>
                    <input name="stock" type="number" value={formData.stock} onChange={handleChange} placeholder="Quantity" className="w-full px-6 py-4 rounded-2xl bg-[#f0f9f4] border-none focus:ring-2 focus:ring-[#ffb703] font-medium" required />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-[#1b4332] uppercase ml-2">Short Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full px-6 py-4 rounded-3xl bg-[#f0f9f4] border-none focus:ring-2 focus:ring-[#ffb703] font-medium resize-none" placeholder="Describe the quality..." required></textarea>
                </div>

                {/* --- FESTIVAL OFFER SECTION --- */}
                <div className="bg-[#1b4332]/5 p-6 rounded-[2rem] border border-[#d8f3dc] space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      name="isFestivalOffer" 
                      type="checkbox" 
                      checked={formData.isFestivalOffer} 
                      onChange={handleChange} 
                      className="w-6 h-6 rounded-md text-[#ffb703] border-none focus:ring-[#ffb703]" 
                    />
                    <span className="text-sm font-black text-[#1b4332] uppercase tracking-wider">Apply Festival Discount?</span>
                  </label>

                  {formData.isFestivalOffer && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-[#40916c] uppercase ml-2 flex items-center gap-1">
                          <Percent size={12} /> Discount %
                        </label>
                        <input 
                          name="discountPercentage" 
                          type="number" 
                          value={formData.discountPercentage} 
                          onChange={handleChange} 
                          max="100"
                          min="0"
                          className="w-full px-6 py-3 rounded-xl bg-white border-2 border-[#b7e4c7] focus:border-[#ffb703] font-bold outline-none" 
                        />
                      </div>
                      <div className="flex flex-col justify-center px-4">
                        <p className="text-xs font-bold text-gray-500 uppercase">Discounted Price:</p>
                        <p className="text-xl font-black text-[#1b4332]">Rs. {calculateDiscountedPrice()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-end border-t border-[#d8f3dc] pt-8 gap-6">
              <button 
                type="submit" 
                disabled={loading}
                className={`w-full md:w-auto px-12 py-5 rounded-full font-black flex items-center justify-center gap-3 shadow-xl transition-all hover:scale-105 active:scale-95 
                  ${loading ? 'bg-gray-300' : 'bg-[#ffb703] text-[#1b4332] hover:bg-[#ffd60a]'}`}
              >
                <Save size={24} /> {loading ? 'SAVING...' : 'CONFIRM & LIST PRODUCT'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;