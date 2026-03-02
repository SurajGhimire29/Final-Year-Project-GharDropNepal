const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please provide username"],
    },
    email: {
      type: String,
      required: [true, "Please provide Email"],
      unique: true,
    },
    phoneNumber: {
      type: Number,
      required: [true, "Please provide PhoneNumber"],
    },
    password: {
      type: String,
     
    },
    role: {
      type: String,
      enum: ["customer","vendor","deliveryBoy"],
      require :true,
      default: "customer",
    },
    otp:{
      type:Number,
    },
   otpExpires: {
      type: Date, // Added this so the expiration check actually works
    },
    isVerified: { // Changed from isOtpVerified to match your Controller
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);
const User = mongoose.model("User", userSchema);
module.exports = User
