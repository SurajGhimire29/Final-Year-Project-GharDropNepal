import React, { Suspense, lazy, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Navbar from "./components/Nav";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Loading from "./components/Loading";
import VendorHome from "./pages/VendorHome";

// Helper for route transitions (keeps the bike animation visible for 2s)
const lazyWithDelay = (importFunc, delay = 2000) => {
  return lazy(() =>
    Promise.all([
      importFunc(),
      new Promise((resolve) => setTimeout(resolve, delay)),
    ]).then(([module]) => module)
  );
};

// 1. Add Cart to your Lazy Imports
const SignIn = lazyWithDelay(() => import("./pages/SignIn"));
const SignUp = lazyWithDelay(() => import("./pages/SignUp"));
const HomePage = lazyWithDelay(() => import("./pages/HomePage"));
const ProductsPage = lazyWithDelay(() => import("./pages/ProductPages"));
const SingleProductPage = lazyWithDelay(() => import("./pages/SingleProductPage"));
const Profile = lazyWithDelay(() => import("./pages/Profile"));
const TrackingPage = lazyWithDelay(() => import("./pages/TrackingPage"));
const Cart = lazyWithDelay(() => import("./pages/Cart")); // New Cart Page

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
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<SingleProductPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/track-order" element={<TrackingPage />} />
            <Route path="/cart" element={<Cart />} />

            
          </Route>
            <Route path="/vendor-dashboard" element={<VendorHome />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;