const bcrypt = require("bcryptjs");
const User = require("./model/userModel");

const adminSeeder = async () => {
  try {
    // 1. Define the admin email in a variable to avoid mistakes
    const ADMIN_EMAIL = "ghardrop@gmail.com";

    // 2. Check if THIS specific email exists
    const isAdminExists = await User.findOne({ email: ADMIN_EMAIL });

    if (!isAdminExists) {
      await User.create({
        fullName: "System Admin",
        email: ADMIN_EMAIL, // Now matches the check above
        password: bcrypt.hashSync("admin123", 10), 
        phoneNumber: 9814151831,
        role: "admin",
        isVerified: true, 
      });
      console.log("✅ Admin seeded successfully");
    } else {
      console.log("ℹ️ Admin already exists in the database");
    }
  } catch (error) {
    console.error("❌ Admin Seeding Error:", error.message);
  }
};

module.exports = adminSeeder;