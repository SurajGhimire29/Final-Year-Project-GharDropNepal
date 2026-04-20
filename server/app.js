require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const { connectDatabase } = require("./config/connectDB");

// Routes
const authRouter = require("./routes/authRoutes");
const productRouter = require("./routes/productRoute");
const cartRouter = require("./routes/cartRoutes");
const adminSeeder = require("./adminSeeder");
const adminRouter = require("./routes/adminRoutes");
const bannerRouter = require("./routes/bannerRoutes");
const orderRouter = require("./routes/orderRoutes");
const paymentRouter = require("./routes/paymentRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const contactRouter = require("./routes/contactRoutes"); // Public Submission
const notificationRouter = require("./routes/notificationRoutes");

const app = express();

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Connect database
connectDatabase().then(() => {
  adminSeeder();
});

// Global Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- SOCKET.IO REAL-TIME LOGIC ---
io.on("connection", (socket) => {
  // Log connection (optional)

  socket.on("joinOrder", (orderId) => {
    socket.join(orderId);
  });

  socket.on("updateRiderLocation", ({ orderId, location }) => {
    io.to(orderId).emit("riderLocationUpdated", location);
  });

  socket.on("updateUserLocation", ({ orderId, location }) => {
    io.to(orderId).emit("userLocationUpdated", location);
  });

  socket.on("disconnect", () => {
  // Log disconnection (optional)
  });
});

// --- ROUTE HIERARCHY ---
// 1. First, register Public and Authentication routes
app.use("", authRouter);
app.use("", contactRouter); // Moved up to ensure it's hit before admin blocks
app.use("", productRouter);
app.use("", bannerRouter);

// 2. Then, register Protected/Transactional routes
app.use("", adminRouter);
app.use("", orderRouter);
app.use("", paymentRouter);
app.use("", cartRouter);
app.use("", reviewRouter);
app.use("", notificationRouter);

// Start Server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`--- Ghar Drop Nepal Server Running on Port ${port} ---`);
});