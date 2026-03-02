import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Package, ShoppingCart, LogIn, UserCircle } from 'lucide-react';
import logo from "../assets/image.png";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-10 py-1 bg-[#f0f9f4] shadow-sm sticky top-0 z-50 border-b border-[#d8f3dc]">
      
      <Link to="/home" className="flex items-center transform transition-transform hover:scale-105">
        <img 
          src={logo} 
          alt="GharDropNepal" 
          className="h-20 w-auto object-contain mix-blend-multiply" 
        />
      </Link>

      <div className="hidden md:flex items-center gap-12">
        <NavLink to="/home" icon={<Home size={18} />} label="Home" />
        <NavLink to="/products" icon={<Package size={18} />} label="Products" />
        <NavLink to="/cart" icon={<ShoppingCart size={18} />} label="Cart" />
      </div>

      <div className="flex items-center gap-6">
        <Link 
          to="/signin" 
          className="flex items-center gap-2 text-[#1b4332] hover:text-[#2d6a4f] transition-colors"
        >
          <LogIn size={20} className="stroke-[2.5px]" />
          <span className="text-sm font-black uppercase tracking-tighter">Sign In</span>
        </Link>
        
        <div className="h-8 w-[1.5px] bg-[#b7e4c7]"></div>
        
        <Link to="/profile">
          <UserCircle 
            size={34} 
            className="text-[#1b4332] hover:scale-110 transition-transform cursor-pointer" 
          />
        </Link>
      </div>
    </nav>
  );
};

const NavLink = ({ icon, label, to }) => (
  <Link 
    to={to} 
    className="relative flex flex-col items-center group text-[#1b4332] opacity-90 hover:opacity-100"
  >
    <div className="group-hover:-translate-y-1 transition-transform duration-300 ease-out">
      {icon}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest mt-0.5">{label}</span>
    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#1b4332] transition-all duration-300 group-hover:w-full"></span>
  </Link>
);

export default Navbar;