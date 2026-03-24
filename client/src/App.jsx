import React, { Suspense, lazy, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import Navbar from "./components/Nav";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Loading from "./components/Loading";

// Standard Imports for Dashboard Components
import VendorHome from "./pages/Vendor/VendorHome";
import AddProduct from "./pages/Vendor/AddProduct";
import VendorProfile from "./pages/Vendor/VendorProfile";
import VendorProduct from "./pages/Vendor/VendorProduct";
import Profile from "./pages/Customer/Profile";
import AdminHome from "./pages/Admin/AdminHome";
import DeliveryBoyDB from "./pages/Delivery/DeliveryDB";

// Admin Management Imports
import VerificationHub from "./pages/Admin/VerificationHub";
import GlobalInventory from "./pages/Admin/GlobalInventory";
import ManageDelivery from "./pages/Admin/ManageDelivery";
import ManageUsers from "./pages/Admin/ManageUsers";
import ManageVendor from "./pages/Admin/ManageVendor";

// --- Lazy Loading Setup ---
const lazyWithDelay = (importFunc, delay = 2000) => {
  return lazy(() =>
    Promise.all([
      importFunc(),
      new Promise((resolve) => setTimeout(resolve, delay)),
    ]).then(([module]) => module)
  );
};

const SignIn = lazyWithDelay(() => import("./pages/Customer/SignIn"));
const SignUp = lazyWithDelay(() => import("./pages/Customer/SignUp"));
const HomePage = lazyWithDelay(() => import("./pages/Customer/HomePage"));
const ProductsPage = lazyWithDelay(() => import("./pages/Customer/ProductPages"));
const SingleProductPage = lazyWithDelay(() => import("./pages/Customer/SingleProductPage"));
const TrackingPage = lazyWithDelay(() => import("./pages/Customer/TrackingPage"));
const Cart = lazyWithDelay(() => import("./pages/Customer/Cart"));

// --- Role-Based Protected Route Components ---
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

// --- Layout Wrapper ---
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

  const [user, setUser] = useState(() => {
    const role = localStorage.getItem("userRole");
    const name = localStorage.getItem("userName");
    return role && name ? { role, fullName: name } : null;
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (initialLoading) {
    return <Loading />;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* --- Public Auth Routes --- */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Navigate to="/signin" replace />} />

          {/* --- Customer/General Routes (MainLayout) --- */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage user={user} />} />
            <Route path="/home" element={<HomePage user={user} />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<SingleProductPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/track-order" element={<TrackingPage />} />
            <Route path="/cart" element={<Cart />} />
          </Route>

          {/* --- Vendor Protected Routes --- */}
          <Route
            path="/vendor-dashboard"
            element={
              <VendorRoute user={user}>
                <VendorHome />
              </VendorRoute>
            }
          />
          <Route
            path="/addproduct"
            element={
              <VendorRoute user={user}>
                <AddProduct />
              </VendorRoute>
            }
          />
          <Route
            path="/vendorProfile"
            element={
              <VendorRoute user={user}>
                <VendorProfile />
              </VendorRoute>
            }
          />
          <Route
            path="/my-products"
            element={
              <VendorRoute user={user}>
                <VendorProduct />
              </VendorRoute>
            }
          />

          {/* --- Admin Protected Routes --- */}
          <Route
            path="/admin-dashboard"
            element={
              <AdminRoute user={user}>
                <AdminHome />
              </AdminRoute>
            }
          />
          {/* NEW Admin Management Routes */}
          <Route
            path="/admin/verifications"
            element={
              <AdminRoute user={user}>
                <VerificationHub />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminRoute user={user}>
                <GlobalInventory />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/delivery"
            element={
              <AdminRoute user={user}>
                <ManageDelivery />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute user={user}>
                <ManageUsers />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/vendor-details"
            element={
              <AdminRoute user={user}>
                <ManageVendor />
              </AdminRoute>
            }
          />

          {/* --- Delivery Boy Protected Routes --- */}
          <Route
            path="/delivery-dashboard"
            element={
              <DeliveryRoute user={user}>
                <DeliveryBoyDB />
              </DeliveryRoute>
            }
          />

          {/* --- Fallback Route --- */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;