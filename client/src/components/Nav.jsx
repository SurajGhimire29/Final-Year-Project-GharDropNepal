import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Package, ShoppingCart, LogIn, UserCircle, LogOut } from 'lucide-react';
import logo from "../assets/image.png";

const Navbar = () => {
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));
  const [userName, setUserName] = useState(localStorage.getItem("userName"));
  const [userAvatar, setUserAvatar] = useState(localStorage.getItem("userAvatar"));
  
  const location = useLocation();
  const navigate = useNavigate();

  // Function to refresh state from LocalStorage
  const syncStorage = () => {
    setUserRole(localStorage.getItem("userRole"));
    setUserName(localStorage.getItem("userName"));
    setUserAvatar(localStorage.getItem("userAvatar"));
  };

  useEffect(() => {
    // Sync when route changes
    syncStorage();
  }, [location]);

  useEffect(() => {
    // Listen for the custom "storage" event triggered by the Profile page
    window.addEventListener("storage", syncStorage);
    return () => window.removeEventListener("storage", syncStorage);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUserRole(null);
    setUserName(null);
    setUserAvatar(null);
    navigate("/signin");
  };

  const isLoggedIn = userRole !== null && userRole !== "";

  return (
    <nav className="flex items-center justify-between px-10 py-1 bg-[#f0f9f4] shadow-sm sticky top-0 z-50 border-b border-[#d8f3dc]">
      
      <Link to="/home" className="flex items-center transform transition-transform hover:scale-105">
        <img src={logo} alt="GharDropNepal" className="h-20 w-auto object-contain mix-blend-multiply" />
      </Link>

      <div className="hidden md:flex items-center gap-12">
        <NavLink to="/home" icon={<Home size={18} />} label="Home" />
        <NavLink to="/products" icon={<Package size={19} />} label="Products" />
        {isLoggedIn && (
          <NavLink to="/cart" icon={<ShoppingCart size={18} />} label="Cart" />
        )}
      </div>

      <div className="flex items-center gap-6">
        {!isLoggedIn ? (
          <>
            <Link 
              to="/signin" 
              className="flex items-center gap-2 text-[#1b4332] hover:text-[#2d6a4f] transition-colors"
            >
              <LogIn size={20} className="stroke-[2.5px]" />
              <span className="text-sm font-black uppercase tracking-tighter">Sign In</span>
            </Link>
            <div className="h-8 w-[1.5px] bg-[#b7e4c7]"></div>
          </>
        ) : (
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors mr-2"
          >
            <LogOut size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Logout</span>
          </button>
        )}
        
        {/* PROFILE SECTION */}
        <Link to="/profile" className="flex items-center gap-3 group">
          {isLoggedIn ? (
            <>
              <div className="hidden md:flex flex-col items-end leading-none">
                <span className="text-[11px] font-black text-[#1b4332] uppercase tracking-tighter">
                  {userName || "GharDrop User"}
                </span>
                <span className="text-[9px] font-bold text-[#40916c] uppercase">
                  {userRole}
                </span>
              </div>
              
              <div className="w-10 h-10 rounded-full border-2 border-[#1b4332] overflow-hidden bg-white group-hover:scale-110 transition-transform flex items-center justify-center shadow-sm">
                {(userAvatar && userAvatar !== "" && userAvatar !== "undefined") ? (
                  <img 
                    src={userAvatar} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                    key={userAvatar} // Force re-render when URL changes
                    onError={(e) => {
                      setUserAvatar(null);
                      localStorage.removeItem("userAvatar");
                    }}
                  />
                ) : (
                  <div className="bg-[#1b4332] w-full h-full flex items-center justify-center text-[#ffb703] font-black">
                    {userName?.charAt(0).toUpperCase() || "G"}
                  </div>
                )}
              </div>
            </>
          ) : (
            <UserCircle 
              size={34} 
              className="text-[#1b4332] hover:scale-110 transition-transform cursor-pointer" 
            />
          )}
        </Link>
      </div>
    </nav>
  );
};

const NavLink = ({ icon, label, to }) => (
  <Link to={to} className="relative flex flex-col items-center group text-[#1b4332] opacity-90 hover:opacity-100">
    <div className="group-hover:-translate-y-1 transition-transform duration-300 ease-out">{icon}</div>
    <span className="text-[10px] font-bold uppercase tracking-widest mt-0.5">{label}</span>
    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#1b4332] transition-all duration-300 group-hover:w-full"></span>
  </Link>
);

export default Navbar;