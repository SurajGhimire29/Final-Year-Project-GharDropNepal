require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connectDatabase } = require("./config/connectDB");
const authRouter = require("./routes/authRoutes");
const productRouter = require("./routes/productRoute");
const cartRouter = require("./routes/cartRoutes");
const adminSeeder = require("./adminSeeder");
const adminRouter = require("./routes/adminRoutes");


const app = express();

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

// Routes
app.use("", adminRouter);
app.use("", authRouter);
app.use("", productRouter);
app.use("", cartRouter);

// Start server
const port = process.env.PORT ;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});