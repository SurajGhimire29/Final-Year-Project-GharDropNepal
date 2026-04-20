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
  Image as ImageIcon,
  ChevronRight,
  DollarSign 
} from "lucide-react";

const VendorHome = () => {
  const navigate = useNavigate();
  const [vendorProducts, setVendorProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [vendorName, setVendorName] = useState("");
  
  const [statsData, setStatsData] = useState({
    activeProducts: 0,
    totalOrders: 0,
    totalEarnings: 0,
    todayRevenue: 0
  });

  const API_URL = "http://localhost:3000";

  useEffect(() => {
    const initDashboard = async () => {
      try {
        // 1. Auth Check
        const authRes = await axios.get(`${API_URL}/me`, { withCredentials: true });
        if (authRes.data.user.role !== "vendor") {
          return navigate("/signin");
        }
        
        const vId = authRes.data.user._id;
        setVendorName(authRes.data.user.fullName);

        // 2. Fetch Data
        const [prodRes, statsRes] = await Promise.all([
          axios.get(`${API_URL}/products`),
          axios.get(`${API_URL}/vendor/stats`, { withCredentials: true })
        ]);

        let myFilteredProducts = [];

        // 3. FIX: Enhanced Filtering Logic
        if (prodRes.data.success) {
          myFilteredProducts = prodRes.data.products.filter(p => {
            // Case 1: product.user is just an ID string
            // Case 2: product.user is an object (because of .populate)
            const productUserId = p.user?._id || p.user; 
            return productUserId?.toString() === vId.toString();
          });
          setVendorProducts(myFilteredProducts);
        }

        // 4. Process Stats
        let orderCount = 0;
        let earningsValue = 0;
        let revenueToday = 0;

        if (statsRes.data.success) {
          const orders = statsRes.data.orders || [];
          earningsValue = statsRes.data.stats?.totalEarnings || 0;
          orderCount = orders.length;

          const today = new Date().toDateString();
          revenueToday = orders
            .filter(o => o.shippingStatus === "Delivered" && new Date(o.updatedAt).toDateString() === today)
            .reduce((sum, o) => sum + ((o.totalPrice || 0) * 0.90), 0);
        }

        // 5. Final State Sync
        setStatsData({
          activeProducts: myFilteredProducts.length, // Uses the filtered list count
          totalOrders: orderCount,
          totalEarnings: Math.round(earningsValue),
          todayRevenue: Math.round(revenueToday)
        });

      } catch (error) {
        console.error("Dashboard Init Error:", error);
        navigate("/signin");
      } finally {
        setLoadingProducts(false);
      }
    };

    initDashboard();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.get(`${API_URL}/signout`, { withCredentials: true });
      navigate("/signin");
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  const visualStats = [
    { label: "Active Products", value: statsData.activeProducts, icon: <Package size={24} />, color: "bg-[#40916c]" },
    { label: "Total Orders", value: statsData.totalOrders, icon: <ShoppingBag size={24} />, color: "bg-[#1b4332]" },
    { label: "Total Earnings", value: `Rs. ${statsData.totalEarnings.toLocaleString()}`, icon: <DollarSign size={24} />, color: "bg-[#2d6a4f]" },
    { label: "Today's Revenue", value: `Rs. ${statsData.todayRevenue.toLocaleString()}`, icon: <TrendingUp size={24} />, color: "bg-[#ffb703]" },
  ];

  return (
    <div className="flex min-h-screen bg-[#f0f9f4]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1b4332] text-white p-6 hidden md:flex flex-col rounded-r-[2rem] shadow-2xl">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="bg-[#ffb703] p-2 rounded-xl text-[#1b4332]">
            <Package size={24} strokeWidth={3} />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter">Vendor Portal</h1>
        </div>

        <nav className="flex-grow space-y-2">
          <button onClick={() => navigate("/vendor-dashboard")} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold bg-[#ffb703] text-[#1b4332]">
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button onClick={() => navigate("/my-products")} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold hover:bg-[#2d6a4f] transition-all">
            <Package size={20} /> My Products
          </button>
          <button onClick={() => navigate("/vendor/orders")} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold hover:bg-[#2d6a4f] transition-all">
            <ShoppingBag size={20} /> Orders
          </button>
          <button onClick={() => navigate("/vendor/earnings")} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold hover:bg-[#2d6a4f] transition-all text-[#b7e4c7] hover:text-white">
            <DollarSign size={20} /> Earnings
          </button>
          <button onClick={() => navigate("/vendor/request-banner")} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold hover:bg-[#2d6a4f] transition-all text-[#b7e4c7] hover:text-white">
            <ImageIcon size={20} /> Request Banner
          </button>
          <button onClick={() => navigate("/vendorProfile")} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold hover:bg-[#2d6a4f] transition-all">
            <Settings size={20} /> Vendor Profile
          </button>
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-[#b7e4c7] font-bold hover:text-white mt-auto transition-colors">
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-[#1b4332] uppercase">
              Welcome Back, {vendorName || "Vendor"}!
            </h2>
            <p className="text-[#40916c] font-medium">Manage your GharDrop shop and track sales.</p>
          </div>
          <button onClick={() => navigate("/addproduct")} className="bg-[#1b4332] text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-[#2d6a4f] transition-all hover:scale-105 shadow-lg active:scale-95">
            <Plus size={20} strokeWidth={3} /> ADD NEW PRODUCT
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {visualStats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-[#d8f3dc] flex items-center gap-5">
              <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs font-black text-[#40916c] uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl font-black text-[#1b4332]">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Marketing CTA */}
        <div onClick={() => navigate("/vendor/request-banner")} className="mb-10 bg-gradient-to-r from-[#1b4332] to-[#2d6a4f] p-8 rounded-[2.5rem] text-white flex justify-between items-center cursor-pointer hover:shadow-2xl transition-all group border-4 border-[#ffb703]/20">
          <div className="flex items-center gap-6">
            <div className="bg-[#ffb703] p-4 rounded-3xl text-[#1b4332]">
              <ImageIcon size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight">Boost Your Sales!</h3>
              <p className="text-[#b7e4c7] font-bold">Request a homepage banner to reach more customers.</p>
            </div>
          </div>
          <ChevronRight size={32} className="group-hover:translate-x-2 transition-transform text-[#ffb703]" />
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#d8f3dc]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-[#1b4332] uppercase tracking-tight">Recent Products</h3>
            <button onClick={() => navigate("/vendorProfile")} className="p-2 hover:bg-[#f0f9f4] rounded-full text-[#40916c] transition-colors">
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
                    <img src={product.images[0]?.url} alt={product.name} className="w-12 h-12 rounded-xl object-cover border-2 border-white" />
                    <div>
                      <p className="font-black text-[#1b4332]">{product.name}</p>
                      <p className="text-xs font-bold text-[#40916c] uppercase">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="font-black text-[#1b4332]">Rs. {product.price}</p>
                    <span className="text-[10px] font-bold text-white bg-[#40916c] px-2 py-0.5 rounded-full uppercase">Live</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-[#b7e4c7] rounded-3xl h-64 flex flex-col items-center justify-center text-[#40916c]">
              <Package size={48} className="opacity-20 mb-2" />
              <p className="font-bold">No products uploaded yet.</p>
              <button onClick={() => navigate("/addproduct")} className="text-sm underline mt-2">Add your first product</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default VendorHome;