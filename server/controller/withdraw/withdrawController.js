const Withdrawal = require('../../model/withDrawModel');
const Order = require('../../model/orderModel');
const User = require("../../model/userModel");

exports.requestPayout = async (req, res) => {
  try {
    const riderId = req.user._id;

    // 1. Re-calculate current earnings to prevent front-end manipulation
    const completedOrders = await Order.find({
      deliveryBoy: riderId,
      shippingStatus: "Delivered"
    });

    const totalEarned = completedOrders.reduce((sum, order) => {
      return sum + (order.deliveryCharge * 0.95);
    }, 0);

    // 2. Subtract what they have already withdrawn (if you track this in User model)
    const currentBalance = totalEarned - (req.user.totalWithdrawn || 0);

    // 3. Validation
    if (currentBalance < 500) {
      return res.status(400).json({ 
        success: false, 
        message: "Minimum balance of Rs. 500 required for withdrawal." 
      });
    }

    // 4. Create the request
    const payoutRequest = await Withdrawal.create({
      rider: riderId,
      amount: Math.round(currentBalance),
      status: 'Pending',
      type: 'Payout'
    });

    res.status(201).json({
      success: true,
      message: "Withdrawal request submitted successfully",
      data: payoutRequest
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Inside your withdrawal controller
exports.requestVendorPayout = async (req, res) => {
  try {
    const vendorId = req.user._id;

    // 1. Get Delivered Orders (Same as stats)
    const orders = await Order.find({ "items.vendor": vendorId, shippingStatus: "Delivered" });

    // 2. Calculate Total Earned (Matches the 15,840 you see)
    let totalEarned = 0;
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.vendor.toString() === vendorId.toString()) {
          totalEarned += (item.price * item.quantity) * 0.90;
        }
      });
    });

    // 3. Subtract what's already been withdrawn/requested
    const transactions = await Withdrawal.find({ vendor: vendorId });
    const totalWithdrawnOrRequested = transactions
      .filter(t => t.status === "Completed" || t.status === "Pending" || t.status === "Unpaid")
      .reduce((sum, t) => sum + t.amount, 0);

    const currentBalance = totalEarned - totalWithdrawnOrRequested;

    // Log calculated balance for debugging (optional)

    if (currentBalance < 1000) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimum balance of Rs. 1000 required. Your current balance is Rs. ${Math.round(currentBalance)}` 
      });
    }

    // 5. Create the request
    const payoutRequest = await Withdrawal.create({
      vendor: vendorId,
      amount: Math.floor(currentBalance),
      status: 'Pending',
      type: 'Payout'
    });

    res.status(201).json({ success: true, message: "Request Sent!", data: payoutRequest });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getVendorEarningsStats = async (req, res) => {
    try {
        const vendorId = req.user._id;

        // 1. Get ALL orders that contain at least one item from this vendor
        // Using 'items.vendor' to match your createOrder logic
        const orders = await Order.find({ 
            "items.vendor": vendorId, 
            shippingStatus: "Delivered" 
        }).lean();

        // 2. Calculate Total Earned (90% to vendor)
        let totalEarned = 0;
        orders.forEach(order => {
            order.items.forEach(item => {
                // Check if this specific item belongs to the logged-in vendor
                if (item.vendor && item.vendor.toString() === vendorId.toString()) {
                    // Ensure price and quantity are treated as numbers
                    const itemPrice = Number(item.price) || 0;
                    const itemQty = Number(item.quantity) || 1;
                    totalEarned += (itemPrice * itemQty) * 0.90;
                }
            });
        });

        // 3. Calculate Pending Clearance (Shipped or Processing)
        const pendingOrders = await Order.find({ 
            "items.vendor": vendorId, 
            shippingStatus: { $in: ["Shipped", "Processing", "Confirmed", "Order Placed"] } 
        }).lean();

        let pending = 0;
        pendingOrders.forEach(order => {
            order.items.forEach(item => {
                if (item.vendor && item.vendor.toString() === vendorId.toString()) {
                    const itemPrice = Number(item.price) || 0;
                    const itemQty = Number(item.quantity) || 1;
                    pending += (itemPrice * itemQty) * 0.90;
                }
            });
        });

        // 4. Get Withdrawal history to calculate "Withdrawable" balance
        const transactions = await Withdrawal.find({ 
            vendor: vendorId 
        }).sort({ requestedAt: -1 }); // Removed .lean() to allow .save()

        // --- AUTO-SETTLE DEBTS (Banner Fees) ---
        let currentTempBalance = totalEarned - transactions
            .filter(t => t.status === "Completed" || t.status === "Pending")
            .reduce((sum, t) => sum + Number(t.amount), 0);

        for (const t of transactions) {
            if (t.status === "Unpaid" && t.type === "Banner Fee") {
                if (currentTempBalance >= t.amount) {
                    t.status = "Completed";
                    t.paidAt = Date.now();
                    await t.save();
                    
                    const User = require("../../model/userModel");
                    await User.findByIdAndUpdate(vendorId, { $inc: { totalWithdrawn: t.amount } });
                    currentTempBalance -= t.amount;
                }
            }
        }

        const totalWithdrawnOrRequested = transactions
            .filter(t => t.status === "Completed" || t.status === "Pending" || t.status === "Unpaid")
            .reduce((sum, t) => sum + Number(t.amount), 0);

        // Final Calculation
        const withdrawableBalance = Math.max(0, totalEarned - totalWithdrawnOrRequested);

        // 5. Build Combined Ledger History
        // Orders are Income (+), Withdrawals/Fees are Deductions (-)
        const history = [
            ...orders.map(o => ({
                _id: o._id,
                date: o.updatedAt || o.createdAt,
                amount: o.items
                    .filter(item => item.vendor && item.vendor.toString() === vendorId.toString())
                    .reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0) * 0.90,
                type: 'Income',
                reference: `Order #${o._id.slice(-6).toUpperCase()}`,
                status: o.shippingStatus
            })),
            ...transactions.map(t => ({
                _id: t._id,
                date: t.paidAt || t.requestedAt,
                amount: t.amount,
                type: t.type === 'Banner Fee' ? 'Banner Fee' : 'Payout',
                reference: t.type === 'Banner Fee' ? 'Marketing Charge' : 'Cash Withdrawal',
                status: t.status
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        // Calculate actual paid amount from history (Excluding Unpaid/Pending)
        const totalPaid = transactions
            .filter(t => t.status === "Completed")
            .reduce((sum, t) => sum + Number(t.amount), 0);

        res.status(200).json({
            success: true,
            data: {
                totalEarned: Math.round(totalEarned),
                totalWithdrawn: totalPaid,
                withdrawable: Math.round(withdrawableBalance),
                pending: Math.round(pending),
                transactions: history 
            }
        });

    } catch (error) {
        console.error("Vendor Stats Error:", error.message);
        res.status(500).json({ 
            success: false, 
            message: "Error calculating earnings: " + error.message 
        });
    }
};  
// Controller: getWithdrawalRequests
// Updated getWithdrawalRequests in your controller
exports.getWithdrawalRequests = async (req, res) => {
  // Fetch withdrawal requests based on role

  try {
    const { role } = req.query;
    let filter = {};
    let populatePath = '';

    // 1. Set filter and determine which field to populate
    if (role === 'rider') {
      filter = { rider: { $exists: true } };
      populatePath = 'rider';
    } else {
      filter = { vendor: { $exists: true } };
      populatePath = 'vendor'; // Correctly target vendor for vendor requests
    }

    // 2. Dynamic Mongoose Query
    const withdrawals = await Withdrawal.find(filter)
      .populate({
        path: populatePath, // This now changes based on the role
        model: User,
        select: 'fullName phoneNumber email shopName' // Added shopName for vendors
      })
      .sort({ requestedAt: -1 }) // Use requestedAt instead of createdAt
      .lean();


    return res.status(200).json({
      success: true,
      withdrawals,
    });
  } catch (error) {
    console.error("CRITICAL ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateWithdrawalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; 

    const withdrawal = await Withdrawal.findById(id);

    if (!withdrawal) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    // Prevent moving backwards if already completed
    if (withdrawal.status === "Completed") {
      return res.status(400).json({ success: false, message: "This payout is already finalized." });
    }

    // Update status
    withdrawal.status = status;

    if (status === "Completed") {
      withdrawal.paidAt = Date.now();

      // Determine who to update based on which ID exists in the record
      const userId = withdrawal.rider || withdrawal.vendor;

      if (userId) {
        await User.findByIdAndUpdate(userId, {
          $inc: { totalWithdrawn: withdrawal.amount }
        });
      }
    }

    await withdrawal.save();

    res.status(200).json({
      success: true,
      message: `Withdrawal marked as ${status} and user ledger updated`,
      withdrawal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating payout status",
      error: error.message,
    });
  }
};