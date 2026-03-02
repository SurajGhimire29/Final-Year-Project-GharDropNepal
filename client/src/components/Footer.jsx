import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import logo from "../assets/image.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#f0f9f4] border-t border-[#d8f3dc] pt-12 pb-6 px-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        
        <div className="flex flex-col gap-4">
          <img 
            src={logo} 
            alt="GharDropNepal Logo" 
            className="h-24 w-auto object-contain self-start mix-blend-multiply" 
          />
          <p className="text-[#1b4332] text-sm leading-relaxed opacity-80 font-medium">
            Bringing the freshest groceries and essentials directly to your doorstep across Nepal.
          </p>
          <div className="flex gap-4 mt-2">
            <SocialIcon icon={<Facebook size={20} />} href="https://facebook.com" />
            <SocialIcon icon={<Instagram size={20} />} href="https://instagram.com" />
            <SocialIcon icon={<Twitter size={20} />} href="https://twitter.com" />
          </div>
        </div>

        <div>
          <h4 className="text-[#1b4332] font-black uppercase tracking-widest mb-6">Quick Links</h4>
          <ul className="flex flex-col gap-3">
            <FooterLink to="/home" label="Home" />
            <FooterLink to="/products" label="Products" />
            <FooterLink to="/about" label="About Us" />
            <FooterLink to="/contact" label="Contact" />
          </ul>
        </div>

        <div>
          <h4 className="text-[#1b4332] font-black uppercase tracking-widest mb-6">Shop</h4>
          <ul className="flex flex-col gap-3">
            <FooterLink to="/category/vegetables" label="Vegetables" />
            <FooterLink to="/category/fruits" label="Fruits" />
            <FooterLink to="/category/dairy" label="Dairy Products" />
            <FooterLink to="/category/organic" label="Organic Items" />
          </ul>
        </div>

        <div>
          <h4 className="text-[#1b4332] font-black uppercase tracking-widest mb-6">Get in Touch</h4>
          <ul className="flex flex-col gap-4">
            <li className="flex items-center gap-3 text-[#1b4332] text-sm font-medium">
              <MapPin size={18} className="text-[#40916c]" /> 
              Pokhara, Nepal
            </li>
            <li className="flex items-center gap-3 text-[#1b4332] text-sm font-medium">
              <Phone size={18} className="text-[#40916c]" /> 
              +977 98XXXXXXXX
            </li>
            <li className="flex items-center gap-3 text-[#1b4332] text-sm font-medium">
              <Mail size={18} className="text-[#40916c]" /> 
              support@ghardrop.com
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-[#d8f3dc] text-center">
        <p className="text-[#1b4332] text-xs font-bold opacity-60 uppercase tracking-tighter">
          © {currentYear} Ghar Drop Nepal. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

const FooterLink = ({ to, label }) => (
  <li>
    <Link 
      to={to} 
      className="text-[#1b4332] text-sm font-bold opacity-70 hover:opacity-100 hover:translate-x-1 transition-all inline-block"
    >
      {label}
    </Link>
  </li>
);

const SocialIcon = ({ icon, href }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="bg-[#1b4332] text-[#f0f9f4] p-2 rounded-full hover:bg-[#40916c] transition-colors duration-300"
  >
    {icon}
  </a>
);

export default Footer;