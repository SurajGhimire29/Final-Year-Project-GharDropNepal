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
      enum: ["customer", "vendor", "deliveryBoy", "admin"],
      required: true,
      default: "customer",
    },
    avatar: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "" },
    },

    // --- VENDOR SPECIFIC FIELDS ---
    storeName: {
      type: String,
      trim: true,
      required: function () { return this.role === "vendor"; },
    },
    storeAddress: {
      type: String,
      required: function () { return this.role === "vendor"; },
    },
    // ADDED: Store Image for the Shop Front
    storeImage: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "" },
    },
    // Business License Image (Citizenship/PAN/Registration)
    businessLicense: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "" },
    },
    vendorStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // --- DELIVERY BOY SPECIFIC FIELDS ---
    vehicleType: {
      type: String,
      enum: ["bike", "scooter", "cycle", "van"],
      required: function () { return this.role === "deliveryBoy"; },
    },
    vehicleNumber: {
      type: String,
      required: function () { return this.role === "deliveryBoy"; },
    },
    // ADDED: License/ID Image for Delivery Boys
    deliveryLicenseImage: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "" },
    },
    deliveryStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    isAvailable: {
      type: Boolean,
      default: false,
    },
    currentLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },
    

    // --- AUTH & VERIFICATION ---
    otp: { type: Number },
    otpExpires: { type: Date },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;