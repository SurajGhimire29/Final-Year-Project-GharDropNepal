import React, { useState } from 'react';
import { BookOpen, User, Store, Bike } from 'lucide-react';

const UserManual = () => {
  const [activeTab, setActiveTab] = useState('customer');

  const tabs = [
    { id: 'customer', label: 'Customer', icon: <User size={20} /> },
    { id: 'vendor', label: 'Vendor', icon: <Store size={20} /> },
    { id: 'delivery', label: 'Delivery Boy', icon: <Bike size={20} /> }
  ];

  return (
    <div className="min-h-screen bg-[#f0f9f4] py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-[#1b4332] rounded-2xl text-[#ffb703] mb-6">
            <BookOpen size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#1b4332] uppercase italic tracking-tighter mb-4">
            GharDrop <span className="text-[#40916c]">Manual</span>
          </h1>
          <p className="text-[#1b4332] font-bold text-lg max-w-2xl mx-auto">
            Everything you need to know about using GharDrop Nepal. Choose your role below to get started.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-[#1b4332] text-[#ffb703] shadow-lg scale-105'
                  : 'bg-white text-[#1b4332] border border-[#d8f3dc] hover:border-[#40916c] hover:shadow-md'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-[#d8f3dc]">
          {activeTab === 'customer' && (
            <div className="animate-fadeIn">
              <h2 className="text-3xl font-black text-[#1b4332] uppercase tracking-tighter mb-8 border-b-2 border-[#d8f3dc] pb-4">
                Customer Guide
              </h2>
              <div className="space-y-8">
                <ManualSection 
                  title="1. Browsing & Buying Products" 
                  content="Navigate to the 'Products' tab from the top navigation bar. You can search for products, filter by category, and click on any product to view its details. Click 'Add to Cart' to save items for checkout."
                />
                <ManualSection 
                  title="2. Managing Your Cart" 
                  content="Click the Cart icon in the navigation bar. Here you can adjust quantities or remove items. Once ready, click 'Proceed to Checkout'."
                />
                <ManualSection 
                  title="3. Checkout & Payment" 
                  content="At checkout, provide your shipping address (you can drop a pin on the map for accuracy). You can choose between Cash on Delivery (COD) or Digital Wallets (eSewa/Khalti) depending on availability. The delivery charge is calculated automatically."
                />
                <ManualSection 
                  title="4. Live Order Tracking" 
                  content="Once your order is dispatched, you can click on 'Track Order' or 'Live Tracking' to view the real-time location of the delivery rider bringing your items."
                />
              </div>
            </div>
          )}

          {activeTab === 'vendor' && (
            <div className="animate-fadeIn">
              <h2 className="text-3xl font-black text-[#1b4332] uppercase tracking-tighter mb-8 border-b-2 border-[#d8f3dc] pb-4">
                Vendor Guide
              </h2>
              <div className="space-y-8">
                <ManualSection 
                  title="1. Setting Up Your Store" 
                  content="After your account is approved by an admin, you can edit your profile by adding a Store Profile Image and updating your address so customers know where you are located."
                />
                <ManualSection 
                  title="2. Adding Products" 
                  content="Go to your Vendor Dashboard and click 'Add Product' or 'New Listing'. Upload a clear image, set a price, specify the category, and provide the initial stock quantity."
                />
                <ManualSection 
                  title="3. Managing Inventory" 
                  content="In the 'My Products' section, you can view the Total Added stock, Remaining stock, and Sold units for each item you've listed. You can also delete items that are no longer available."
                />
                <ManualSection 
                  title="4. Processing Orders" 
                  content="When a customer orders your items, they will appear in your 'Orders' tab. You must prepare the items for pickup. Once ready, the admin will assign a delivery boy to collect them."
                />
                <ManualSection 
                  title="5. Tracking Earnings" 
                  content="Go to your 'Earnings' tab to see your total revenue. Vendors receive a standard payout rate (e.g., 90%) of their product sales. You can request withdrawals from this panel."
                />
              </div>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="animate-fadeIn">
              <h2 className="text-3xl font-black text-[#1b4332] uppercase tracking-tighter mb-8 border-b-2 border-[#d8f3dc] pb-4">
                Delivery Boy Guide
              </h2>
              <div className="space-y-8">
                <ManualSection 
                  title="1. Going Online" 
                  content="Log in to your Delivery Dashboard. You must toggle your status to 'Online' using the availability switch so the system knows you are ready to accept deliveries."
                />
                <ManualSection 
                  title="2. Receiving & Accepting Orders" 
                  content="When an admin assigns an order to you, it will appear in your Active Deliveries. You will see the vendor pickup location and the customer drop-off location."
                />
                <ManualSection 
                  title="3. Live Location Sharing" 
                  content="The application requires location permissions. While delivering, your live location is shared with the customer so they know when to expect you."
                />
                <ManualSection 
                  title="4. Completing Deliveries" 
                  content="Once you hand the items to the customer, you must mark the order as 'Delivered' in your app. If it's a Cash on Delivery order, collect the exact Total Amount shown."
                />
                <ManualSection 
                  title="5. Your Earnings" 
                  content="Riders earn a percentage (e.g., 95%) of the delivery charges. You can track your completed deliveries and total earnings in the 'Earnings' tab."
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ManualSection = ({ title, content }) => (
  <div className="bg-[#f8fdfa] p-6 rounded-2xl border border-[#e8f5e9]">
    <h3 className="text-xl font-black text-[#1b4332] uppercase tracking-wide mb-3">{title}</h3>
    <p className="text-[#40916c] font-medium leading-relaxed">{content}</p>
  </div>
);

export default UserManual;
