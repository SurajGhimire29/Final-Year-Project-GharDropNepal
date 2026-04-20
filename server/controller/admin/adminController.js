const User = require("../../model/userModel");
const Product = require("../../model/productModel");
const Order = require("../../model/orderModel");

// Get Dashboard Stats
// Make sure to import your Order model at the top of your controller file
// const Order = require("../models/orderModel"); 

exports.getAdminStats = async (req, res) => {
  try {
    const [userCount, productCount, vendorCount, deliveryCount, orders] = await Promise.all([
      User.countDocuments({ role: "customer" }),
      Product.countDocuments(),
      User.countDocuments({ role: "vendor" }),
      User.countDocuments({ role: "deliveryBoy" }),
      Order.find({ 
        $or: [
          { paymentStatus: "Paid" }, 
          { orderStatus: "Delivered" },
          { orderStatus: "Completed" }
        ] 
      })
    ]);

    let totalRevenue = 0;
    let totalProductSubtotal = 0;
    let totalDeliveryFeesCollected = 0;
    let totalAdminProfit = 0;

    orders.forEach(order => {
      // FORCE numbers to prevent string concatenation or NaN issues
      const orderTotal = Number(order.totalAmount) || 0;
      const deliveryCharge = Number(order.deliveryCharge) || 0;
      
      // Calculate Product Price (Total - Delivery)
      // If deliveryCharge is 40 and Total is 840, productPrice will correctly be 800
      const productPrice = orderTotal - deliveryCharge;

      totalRevenue += orderTotal;
      totalProductSubtotal += productPrice;
      totalDeliveryFeesCollected += deliveryCharge;

      // Admin Cuts
      const adminVendorCut = productPrice * 0.10;   // 10% of 800 = 80
      const adminDeliveryCut = deliveryCharge * 0.05; // 5% of 40 = 2
      
      totalAdminProfit += (adminVendorCut + adminDeliveryCut);
    });

    // Final Payouts
    const vendorPayout = totalProductSubtotal * 0.90; // 90% of 800 = 720
    const deliveryOwed = totalDeliveryFeesCollected * 0.95; // 95% of 40 = 38

    res.status(200).json({ 
      success: true, 
      stats: { 
        totalUsers: userCount, 
        totalProducts: productCount, 
        totalVendors: vendorCount, 
        totalDelivery: deliveryCount,
        totalRevenue,               // Should show 840
        vendorProductSales: totalProductSubtotal, // Should show 800
        vendorPayout,               // Should show 720
        deliveryOwed,               // Should show 38
        adminProfit: totalAdminProfit // Should show 82
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const query = role ? { role: { $regex: new RegExp(`^${role}$`, "i") } } : {};
    const users = await User.find(query).sort({ createdAt: -1 }).select("-password");
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching users." });
  }
};

// Verification Hub: Get Pending
exports.getPendingApprovals = async (req, res) => {
  try {
    const pendingUsers = await User.find({
      $or: [
        { role: "vendor", vendorStatus: "pending" },
        { role: "deliveryBoy", deliveryStatus: "pending" }
      ]
    }).select("-password");

    res.status(200).json({ success: true, pendingUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verification Hub: Action (Approve/Reject)
exports.approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "approved" or "rejected"

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Update role-specific status
    if (user.role === "vendor") user.vendorStatus = status;
    else if (user.role === "deliveryBoy") user.deliveryStatus = status;

    // If approved, make them verified so they can log in
    if (status === "approved") {
      user.isVerified = true;
    }

    await user.save();
    res.status(200).json({ success: true, message: `Partner ${status} successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove User
exports.removeUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.role === "admin") return res.status(403).json({ success: false, message: "Cannot remove admins." });
    
    if (user.role === "vendor") await Product.deleteMany({ user: user._id });
    await user.deleteOne();

    res.status(200).json({ success: true, message: "User removed successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAvailableRiders = async (req, res) => {
  try {
    const deliveryBoys = await User.find({
      role: "deliveryBoy",
      isAvailable: true,
      deliveryStatus: "approved" // Only show verified riders
    }).select("fullName phoneNumber vehicleType currentLocation");

    res.status(200).json({ success: true, deliveryBoys });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching riders" });
  }
};

// Get orders that are ready to be picked up
exports.getPendingDispatchOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      // 1. Broaden the status check (Try including both "Order Placed" and "Processing")
      shippingStatus: { $in: ["Order Placed", "Processing", "Confirmed", "Paid"] },
      
      // 2. Ensure no rider is assigned
      $or: [
        { deliveryBoy: { $exists: false } },
        { deliveryBoy: null }
      ]
    })
    .populate("user", "fullName phoneNumber") 
    .sort({ createdAt: -1 });

    // DEBUG LOG: Check your terminal! 
    // This will show you exactly what the database is returning.
    console.log(`Found ${orders.length} potential dispatch orders.`);
    if (orders.length > 0) {
      console.log("Sample Order Status:", orders[0].shippingStatus);
      console.log("Sample Order Payment:", orders[0].paymentInfo || orders[0].paymentDetails);
    }

    res.status(200).json({ 
      success: true, 
      orders,
      count: orders.length 
    });
  } catch (error) {
    console.error("DISPATCH FETCH ERROR:", error);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

exports.getSalesTrend = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trend = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          // Removed orderStatus: "Delivered" because your frontend 
          // depends on 'Paid' or 'Completed' usually. 
          // Adjust based on your actual Order model field names.
          $or: [
            { paymentStatus: "Paid" },
            { shippingStatus: "Delivered" }, 
            { orderStatus: "Completed" }
          ]
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: "$totalAmount" }, // CHANGED: 'revenue' to 'sales'
          orderCount: { $sum: 1 }
        }
      },
      { 
        $project: {
          _id: 0,
          name: "$_id", // Renaming _id to name for Recharts XAxis
          sales: 1,
          orderCount: 1
        }
      },
      { $sort: { "name": 1 } } 
    ]);

    // If no sales exist for the week, the array is empty. 
    // Recharts handles empty arrays better than 'null'.
    res.status(200).json({ success: true, trend });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Vendor and Delivery Performance Reports
// adminController.js - Simplified for testing
exports.getPartnerReports = async (req, res) => {
  try {
    // 1. VENDOR REPORT: 10% Platform Commission on Items Only
    const vendorReport = await Order.aggregate([
      { 
        $match: { 
          "paymentDetails.status": "Completed",
          "orderStatus": "Delivered" 
        } 
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.vendor",
          totalVolume: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          uniqueOrderIds: { $addToSet: "$_id" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "vendorDetails"
        }
      },
      { $unwind: "$vendorDetails" },
      {
        $project: {
          _id: 1,
          "vendorDetails.fullName": 1,
          "vendorDetails.email": 1,
          orderCount: { $size: "$uniqueOrderIds" },
          totalSales: "$totalVolume",
          // System takes 10% from the item sales only
          grossRevenue: { $multiply: ["$totalVolume", 0.10] }
        }
      }
    ]);

    // 2. DELIVERY REPORT: 5% Platform Cut from the Delivery Fee
    const deliveryReport = await Order.aggregate([
      { 
        $match: { 
          orderStatus: "Delivered", 
          deliveryBoy: { $exists: true, $ne: null } 
        } 
      },
      {
        $group: {
          _id: "$deliveryBoy",
          deliveriesCompleted: { $sum: 1 },
          // Sum only the actual delivery charges collected
          totalDeliveryFees: { $sum: "$deliveryCharge" } 
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "riderDetails"
        }
      },
      { $unwind: "$riderDetails" },
      {
        $project: {
          _id: 1,
          "riderDetails.fullName": 1,
          "riderDetails.phoneNumber": 1,
          deliveriesCompleted: 1,
          // Platform takes 5% of the total delivery fees (logistics profit)
          platformProfit: { $multiply: ["$totalDeliveryFees", 0.05] },
          // Rider keeps 95% of the delivery fees
          totalEarned: { $multiply: ["$totalDeliveryFees", 0.95] }
        }
      }
    ]);

    res.status(200).json({ 
      success: true, 
      vendorReport: vendorReport || [], 
      deliveryReport: deliveryReport || [] 
    });
  } catch (error) {
    console.error("REPORT ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

