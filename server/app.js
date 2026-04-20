require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http"); // 1. Import HTTP module
const { Server } = require("socket.io"); // 2. Import Socket.io
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

const app = express();

// 3. Create HTTP Server
const server = http.createServer(app);

// 4. Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Match your React URL
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Connect database
connectDatabase().then(() => {
  adminSeeder();
});

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- SOCKET.IO REAL-TIME LOGIC ---
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Join a unique room for each order
  socket.on("joinOrder", (orderId) => {
    socket.join(orderId);
    console.log(`User/Rider joined order room: ${orderId}`);
  });

  // When Rider moves, send coordinates to everyone in the order room (The User)
  socket.on("updateRiderLocation", ({ orderId, location }) => {
    // .to(orderId) ensures only the user associated with this order gets the update
    io.to(orderId).emit("riderLocationUpdated", location);
  });

  // Optional: When User moves, send coordinates to the Rider
  socket.on("updateUserLocation", ({ orderId, location }) => {
    io.to(orderId).emit("userLocationUpdated", location);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Routes
app.use("", adminRouter);
app.use("", bannerRouter);
app.use("", authRouter);
app.use("", productRouter);
app.use("", orderRouter);
app.use("", paymentRouter);
app.use("", cartRouter);
app.use("", reviewRouter);

// 5. IMPORTANT: Start 'server', not 'app'
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port} with Socket.io enabled`);
});