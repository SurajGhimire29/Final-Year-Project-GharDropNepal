import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Package, ShoppingCart, LogIn, LogOut, BookOpen, MessageSquare } from 'lucide-react';
import axios from 'axios'; 
import logo from "../assets/image.png";

// --- Global Navigation Bar ---
// This component automatically tracks the user's login state and live cart count.
const Navbar = () => {
  // Read initial user data from localStorage
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));
  const [userName, setUserName] = useState(localStorage.getItem("userName"));
  const [userAvatar, setUserAvatar] = useState(localStorage.getItem("userAvatar"));
  const [cartCount, setCartCount] = useState(0); 
  
  const location = useLocation();
  const navigate = useNavigate();

  // Function to securely fetch the current cart count from the database
  const fetchCartCount = async () => {
    if (!localStorage.getItem("userRole")) {
      setCartCount(0);
      return;
    }
    try {
      const { data } = await axios.get('http://localhost:3000/getCart', { withCredentials: true });
      if (data.success) {
        // Calculate total quantity of items in cart
        const totalItems = data.cart.items.reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(totalItems);
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  const syncStorage = () => {
    setUserRole(localStorage.getItem("userRole"));
    setUserName(localStorage.getItem("userName"));
    setUserAvatar(localStorage.getItem("userAvatar"));
  };

  useEffect(() => {
    syncStorage();
    fetchCartCount(); // Fetch count on route change
  }, [location]);

  useEffect(() => {
    window.addEventListener("storage", syncStorage);
    // Sync both storage and cart count every 2 seconds
    const interval = setInterval(() => {
      syncStorage();
      fetchCartCount();
    }, 2000); 

    return () => {
      window.removeEventListener("storage", syncStorage);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    syncStorage();
    setCartCount(0);
    navigate("/signin");
  };

  const isLoggedIn = !!userRole;

  return (
    <nav className="flex items-center justify-between px-10 py-1 bg-[#f0f9f4] shadow-sm sticky top-0 z-50 border-b border-[#d8f3dc]">
      <Link to="/home" className="flex items-center transform transition-transform hover:scale-105">
        <img src={logo} alt="GharDrop" className="h-20 w-auto object-contain mix-blend-multiply" />
      </Link>

      <div className="hidden md:flex items-center gap-12">
        <NavLink to="/home" icon={<Home size={18} />} label="Home" />
        <NavLink to="/products" icon={<Package size={19} />} label="Products" />
        {isLoggedIn && (
          <NavLink 
            to="/cart" 
            icon={<ShoppingCart size={18} />} 
            label="Cart" 
            badge={cartCount} // Pass the count here
          />
        )}
      </div>

      <div className="flex items-center gap-6">
        {!isLoggedIn ? (
          <Link to="/signin" className="flex items-center gap-2 text-[#1b4332] font-black uppercase tracking-tighter">
            <LogIn size={20} />
            <span>Sign In</span>
          </Link>
        ) : (
          <>
            <button onClick={handleLogout} className="text-red-600 font-bold text-[10px] uppercase flex items-center gap-1">
              <LogOut size={14} /> Logout
            </button>
            
            <Link to="/profile" className="flex items-center gap-3 group">
              <div className="hidden md:flex flex-col items-end leading-none">
                <span className="text-[11px] font-black text-[#1b4332] uppercase">{userName || "User"}</span>
                <span className="text-[9px] font-bold text-[#40916c] uppercase">{userRole}</span>
              </div>
              
              <div className="w-10 h-10 rounded-full border-2 border-[#1b4332] overflow-hidden bg-white shadow-sm flex items-center justify-center">
                {userAvatar ? (
                  <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="bg-[#1b4332] w-full h-full flex items-center justify-center text-[#ffb703] font-black">
                    {userName?.charAt(0).toUpperCase() || "G"}
                  </div>
                )}
              </div>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

// Updated NavLink to support a Badge
const NavLink = ({ icon, label, to, badge }) => (
  <Link to={to} className="relative flex flex-col items-center group text-[#1b4332]">
    <div className="relative">
        {icon}
        {/* Only show badge if count is greater than 0 */}
        {badge > 0 && (
            <span className="absolute -top-2 -right-3 bg-[#ffb703] text-[#1b4332] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-[#1b4332] animate-bounce">
                {badge}
            </span>
        )}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest mt-1">{label}</span>
    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#1b4332] transition-all group-hover:w-full"></span>
  </Link>
);

export default Navbar;