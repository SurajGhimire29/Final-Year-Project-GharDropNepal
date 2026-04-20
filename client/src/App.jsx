import React, { Suspense, lazy, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";

// Layout & UI Components
import Navbar from "./components/Nav";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Loading from "./components/Loading";
import { Toaster } from "react-hot-toast";

// Standard Dashboard Components
import VendorHome from "./pages/Vendor/VendorHome";
import AddProduct from "./pages/Vendor/AddProduct";
import VendorProfile from "./pages/Vendor/VendorProfile";
import VendorProduct from "./pages/Vendor/VendorProduct";
import Profile from "./pages/Customer/Profile";
import AdminHome from "./pages/Admin/AdminHome";
import DeliveryBoyDB from "./pages/Delivery/DeliveryDB";

// Admin Management Components
import VerificationHub from "./pages/Admin/VerificationHub";
import GlobalInventory from "./pages/Admin/GlobalInventory";
import ManageDelivery from "./pages/Admin/ManageDelivery";
import ManageUsers from "./pages/Admin/ManageUsers";
import ManageVendor from "./pages/Admin/ManageVendor";
import ConfirmOrder from "./pages/Admin/ConfirmOrder"; 
import VendorOrders from "./pages/Vendor/VendorOrder";
import OrderDetails from "./pages/Vendor/OrderDetails";

// --- Lazy Loading Utility ---
// Removed artificial delay to ensure the app loads instantly
const lazyWithDelay = (importFunc) => {
  return lazy(importFunc);
};

// --- Lazy Loaded Pages ---
const SignIn = lazyWithDelay(() => import("./pages/Customer/SignIn"));
const SignUp = lazyWithDelay(() => import("./pages/Customer/SignUp"));
const ForgotPassword = lazyWithDelay(() => import("./pages/ForgotPassword")); 
const HomePage = lazyWithDelay(() => import("./pages/Customer/HomePage"));
const AboutUs = lazyWithDelay(() => import("./pages/Customer/AboutUs"));
const ProductsPage = lazyWithDelay(() => import("./pages/Customer/ProductPages"));
const SingleProductPage = lazyWithDelay(() => import("./pages/Customer/SingleProductPage"));
const TrackingPage = lazyWithDelay(() => import("./pages/Customer/TrackingPage"));
const Cart = lazyWithDelay(() => import("./pages/Customer/Cart"));
const Checkout = lazyWithDelay(() => import("./pages/Customer/Checkout"));
const History = lazyWithDelay(() => import("./pages/Customer/History"));
const UserManual = lazyWithDelay(() => import("./pages/Customer/UserManual"));
const ContactUs = lazyWithDelay(() => import("./pages/Customer/ContactUs"));
const Notifications = lazyWithDelay(() => import("./pages/Customer/Notifications"));
// Admin/Reports & Finance
const AdminReports = lazyWithDelay(() => import("./pages/Admin/AdminReports"));
const PayVendor = lazyWithDelay(() => import("./pages/Admin/PayVendor")); 
const PayDelivery = lazyWithDelay(() => import("./pages/Admin/PayDelivery")); 

// Customer Tracking
const LiveTracking = lazyWithDelay(() => import("./pages/Customer/LiveTracking"));
const OrderSuccess = lazyWithDelay(() => import("./pages/Customer/OrderSuccess"));

// Payment Pages
const Payment = lazyWithDelay(() => import("./pages/Payment/Payment"));
const PaymentStatus = lazyWithDelay(() => import("./pages/Payment/PaymentStatus"));

// Admin/Vendor Specialized Pages
const ManageBanner = lazyWithDelay(() => import("./pages/Admin/ManageBanner"));
const ManageMessages = lazyWithDelay(() => import("./pages/Admin/ManageMessages"));
const VendorBannerRequest = lazyWithDelay(() => import("./pages/Vendor/VendorBannerRequest"));
const VendorEarnings = lazyWithDelay(() => import("./pages/Vendor/VendorEarnings"));

// Delivery Processing & Earnings
const DeliveryOrderProcess = lazyWithDelay(() => import("./pages/Delivery/DeliveryOrderProcess"));
const DeliveryEarnings = lazyWithDelay(() => import("./pages/Delivery/DeliveryEarnings"));

// --- Role-Based Protected Route Logic ---
const AdminRoute = ({ user, children }) => {
  const storedRole = localStorage.getItem("userRole");
  const isAdmin = (user && user.role === "admin") || storedRole === "admin";
  return isAdmin ? children : <Navigate to="/signin" replace />;
};

const VendorRoute = ({ user, children }) => {
  const storedRole = localStorage.getItem("userRole");
  const isVendor = (user && user.role === "vendor") || storedRole === "vendor";
  return isVendor ? children : <Navigate to="/signin" replace />;
};

const DeliveryRoute = ({ user, children }) => {
  const storedRole = localStorage.getItem("userRole");
  const isDelivery = (user && user.role === "deliveryBoy") || storedRole === "deliveryBoy";
  return isDelivery ? children : <Navigate to="/signin" replace />;
};

// --- Main Layout Wrapper ---
const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#f0f9f4]">
      <Navbar />
      <ScrollToTop />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  const [initialLoading, setInitialLoading] = useState(true);

  // Initialize user state from localStorage
  const [user, setUser] = useState(() => {
    const role = localStorage.getItem("userRole");
    const name = localStorage.getItem("userName");
    return role && name ? { role, fullName: name } : null;
  });

  // Splash screen effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (initialLoading) {
    return <Loading />;
  }

  return (
    <BrowserRouter>
      <Toaster 
        position="top-center" 
        reverseOrder={false} 
        toastOptions={{
          style: {
            background: '#1b4332',
            color: '#fff',
            borderRadius: '2rem',
            padding: '16px 24px',
            border: '2px solid #40916c',
            fontWeight: 'bold',
            fontSize: '14px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          },
          success: {
            iconTheme: {
              primary: '#ffb703',
              secondary: '#1b4332',
            },
          },
          error: {
            style: {
              background: '#450a0a',
              border: '2px solid #991b1b',
            }
          }
        }}
      />
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* --- Auth Routes --- */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} /> 
          <Route path="/login" element={<Navigate to="/signin" replace />} />

          {/* --- Standalone Customer Routes (NO Nav/Footer) --- */}
          <Route path="/product/:id" element={<SingleProductPage />} />
          <Route path="/payment" element={<Payment />} />

          {/* --- Customer & General Routes (With Nav/Footer) --- */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage user={user} />} />
            <Route path="/home" element={<HomePage user={user} />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/vendor/:id" element={<VendorProfile />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/track-order" element={<TrackingPage />} />
            <Route path="/history" element={<History />} />
            <Route path="/live-location" element={<LiveTracking />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment-status" element={<PaymentStatus />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/manual" element={<UserManual />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          {/* --- Vendor Dashboard Routes --- */}
          <Route path="/vendor-dashboard" element={<VendorRoute user={user}><VendorHome /></VendorRoute>} />
          <Route path="/addproduct" element={<VendorRoute user={user}><AddProduct /></VendorRoute>} />
          <Route path="/my-products" element={<VendorRoute user={user}><VendorProduct /></VendorRoute>} />
          <Route path="/vendor/orders" element={<VendorRoute user={user}><VendorOrders /></VendorRoute>} />
          <Route path="/vendor/order/:id" element={<VendorRoute user={user}><OrderDetails /></VendorRoute>} />
          <Route path="/vendorProfile" element={<VendorRoute user={user}><VendorProfile /></VendorRoute>} />
          <Route path="/vendor/request-banner" element={<VendorRoute user={user}><VendorBannerRequest /></VendorRoute>} />
          <Route path="/vendor/earnings" element={<VendorRoute user={user}><VendorEarnings /></VendorRoute>} />

          {/* --- Admin Protected Routes --- */}
          <Route path="/admin-dashboard" element={<AdminRoute user={user}><AdminHome /></AdminRoute>} />
          <Route path="/admin/verifications" element={<AdminRoute user={user}><VerificationHub /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute user={user}><GlobalInventory /></AdminRoute>} />
          <Route path="/admin/delivery" element={<AdminRoute user={user}><ManageDelivery /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute user={user}><ManageUsers /></AdminRoute>} />
          <Route path="/admin/vendor-details" element={<AdminRoute user={user}><ManageVendor /></AdminRoute>} />
          <Route path="/admin/manage-banners" element={<AdminRoute user={user}><ManageBanner /></AdminRoute>} />
          <Route path="/admin/confirm-orders" element={<AdminRoute user={user}><ConfirmOrder /></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute user={user}><AdminReports /></AdminRoute>} />
          <Route path="/admin/pay-vendor" element={<AdminRoute user={user}><PayVendor /></AdminRoute>} />
          <Route path="/admin/pay-delivery" element={<AdminRoute user={user}><PayDelivery /></AdminRoute>} />
          <Route path="/admin/messages" element={<AdminRoute user={user}><ManageMessages /></AdminRoute>} />

          {/* --- Delivery Boy Protected Routes --- */}
          <Route path="/delivery-dashboard" element={<DeliveryRoute user={user}><DeliveryBoyDB /></DeliveryRoute>} />
          <Route path="/delivery/order/:id" element={<DeliveryRoute user={user}><DeliveryOrderProcess /></DeliveryRoute>} />
          <Route path="/delivery/earnings" element={<DeliveryRoute user={user}><DeliveryEarnings /></DeliveryRoute>} />

          {/* --- Fallback --- */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;