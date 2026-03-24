import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Plus,
  Package,
  TrendingUp,
  ShoppingBag,
  Settings,
  LogOut,
  Loader2,
  LayoutDashboard,
  User
} from "lucide-react";

const VendorHome = () => {
  const navigate = useNavigate();
  const [vendorProducts, setVendorProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [vendorId, setVendorId] = useState(null);
  const [vendorName, setVendorName] = useState(""); // Added to store fullName

  // Stats state updated to handle dynamic values
  const [stats, setStats] = useState([
    { label: "Active Products", value: "0", icon: <Package size={24} />, color: "bg-[#40916c]" },
    { label: "Total Orders", value: "0", icon: <ShoppingBag size={24} />, color: "bg-[#1b4332]" },
    { label: "Today's Revenue", value: "Rs. 0", icon: <TrendingUp size={24} />, color: "bg-[#ffb703]" },
  ]);

  useEffect(() => {
    const checkVendorAuth = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/me",
          { withCredentials: true }
        );

        if (res.data.user.role !== "vendor") {
          navigate("/signin");
        } else {
          setVendorId(res.data.user._id);
          setVendorName(res.data.user.fullName); // Set the fullName for the welcome message
          fetchMyProducts(res.data.user._id);
        }

      } catch (error) {
        console.error(error);
        navigate("/signin");
      }
    };

    const fetchMyProducts = async (id) => {
      try {
        const res = await axios.get("http://localhost:3000/products");
        if (res.data.success) {
          // Filter products belonging to this vendor
          const myStuff = res.data.products.filter(p => p.user === id);
          setVendorProducts(myStuff);
        }
      } catch (err) {
        console.error("Error fetching vendor products:", err);
      } finally {
        setLoadingProducts(false);
      }
    };

    checkVendorAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3000/signout", {
        withCredentials: true
      });
      navigate("/signin");
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f0f9f4]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1b4332] text-white p-6 hidden md:flex flex-col rounded-r-[2rem] shadow-2xl">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="bg-[#ffb703] p-2 rounded-xl text-[#1b4332]">
            <Package size={24} strokeWidth={3} />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter">
            Vendor Portal
          </h1>
        </div>

        <nav className="flex-grow space-y-2">
          <button
            onClick={() => navigate("/vendorhome")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold bg-[#ffb703] text-[#1b4332]"
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>

          <button
            onClick={() => navigate("/my-products")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold hover:bg-[#2d6a4f]"
          >
            <Package size={20} />
            My Products
          </button>

          <button
            onClick={() => navigate("/orders")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold hover:bg-[#2d6a4f]"
          >
            <ShoppingBag size={20} />
            Orders
          </button>

          <button
            onClick={() => navigate("/vendorProfile")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold hover:bg-[#2d6a4f]"
          >
            <Settings size={20} />
           Vendor Profile
          </button>
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-[#b7e4c7] font-bold hover:text-white mt-auto"
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-[#1b4332] uppercase">
              Welcome Back, {vendorName || "Vendor"}!
            </h2>
            <p className="text-[#40916c] font-medium">
              Manage your GharDrop shop and track sales.
            </p>
          </div>

          <button
            onClick={() => navigate("/addproduct")}
            className="bg-[#1b4332] text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-[#2d6a4f] transition-all hover:scale-105 shadow-lg active:scale-95"
          >
            <Plus size={20} strokeWidth={3} />
            ADD NEW PRODUCT
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-[2rem] shadow-sm border border-[#d8f3dc] flex items-center gap-5"
            >
              <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs font-black text-[#40916c] uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-2xl font-black text-[#1b4332]">
                  {stat.label === "Active Products" ? vendorProducts.length : stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Products List */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#d8f3dc]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-[#1b4332] uppercase tracking-tight">
              Recent Products
            </h3>
            {/* Added a Settings button for Product Management shortcut */}
            <button 
                onClick={() => navigate("/settings")} 
                className="p-2 hover:bg-[#f0f9f4] rounded-full text-[#40916c] transition-colors"
                title="Vendor Settings"
            >
                <Settings size={20} />
            </button>
          </div>

          {loadingProducts ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-[#1b4332]" size={32} />
            </div>
          ) : vendorProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {vendorProducts.slice(0, 4).map((product) => (
                <div key={product._id} className="flex items-center justify-between p-4 bg-[#f0f9f4] rounded-2xl border border-[#d8f3dc] hover:border-[#40916c] transition-colors">
                  <div className="flex items-center gap-4">
                    <img 
                      src={product.images[0]?.url} 
                      alt={product.name} 
                      className="w-12 h-12 rounded-xl object-cover border-2 border-white"
                    />
                    <div>
                      <p className="font-black text-[#1b4332]">{product.name}</p>
                      <p className="text-xs font-bold text-[#40916c] uppercase">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="font-black text-[#1b4332]">Rs. {product.price}</p>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-white bg-[#40916c] px-2 py-0.5 rounded-full uppercase">Live</span>
                    </div>
                  </div>
                </div>
              ))}
              {vendorProducts.length > 4 && (
                <button onClick={() => navigate("/my-products")} className="text-center text-[#40916c] font-bold text-sm mt-2 underline">
                  View all products
                </button>
              )}
            </div>
          ) : (
            <div className="border-2 border-dashed border-[#b7e4c7] rounded-3xl h-64 flex flex-col items-center justify-center text-[#40916c]">
              <Package size={48} className="opacity-20 mb-2" />
              <p className="font-bold">No products uploaded yet.</p>
              <p className="text-sm">Start by clicking the "Add New Product" button.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default VendorHome;