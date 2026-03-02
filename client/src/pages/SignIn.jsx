import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/image.png";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Renamed for clarity
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear previous errors

    try {
      // 1. Call your actual backend API
      const response = await fetch("http://localhost:3000/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // 2. Store user info (optional but recommended)
        localStorage.setItem("userRole", data.user.role);
        localStorage.setItem("userName", data.user.fullName);

        // 3. Role-Based Redirection Logic
        console.log("Logged in as:", data.user.role);

        switch (data.user.role) {
          case "vendor":
            navigate("/vendor-dashboard");
            break;
          case "deliveryBoy":
            navigate("/delivery-dashboard");
            break;
          case "customer":
            navigate("/home");
            break;
          default:
            navigate("/home");
        }
      } else {
        setErrorMessage(data.message || "Invalid credentials");
      }
    } catch (error) {
      setErrorMessage("Server error. Please try again later.");
      console.error("Login Error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-green-200">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="GharDropNepal" className="w-32 h-auto mb-2" />
        </div>

        <h2 className="text-3xl font-bold text-center text-green-700 mb-2">Welcome Back</h2>
        <p className="text-center text-gray-500 mb-6">Login to your account 🔐</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition-colors"
          >
            Sign In
          </button>
        </form>

        {errorMessage && (
          <p className="text-center mt-4 text-red-500 font-medium bg-red-50 py-2 rounded">
            {errorMessage}
          </p>
        )}

        <p className="text-center text-sm text-gray-600 mt-6">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-green-600 hover:underline font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}