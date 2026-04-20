const mongoose = require('mongoose');
const Order = require('../../model/orderModel');
const Product = require("../../model/productModel");
const Cart = require("../../model/cartModel"); // Ensure you have your Cart model imported

// 1. Create New Order (Customer Side)
// 1. Create New Order (Customer Side)
exports.createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, paymentDetails } = req.body;

        if (!req.user) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        // 1. Process items and calculate product subtotal
        const itemsWithVendor = await Promise.all(items.map(async (item) => {
            const product = await Product.findById(item.product);
            
            if (!product) {
                throw new Error(`Product ${item.product} not found`);
            }

            // DISCOUNT LOGIC: Use discountPrice if available
            const finalPrice = (product.discountPrice && product.discountPrice > 0) 
                ? product.discountPrice 
                : product.price;

            return {
                product: product._id,
                name: product.name,
                price: finalPrice, 
                image: product.image,
                quantity: item.quantity,
                vendor: product.user, 
                itemStatus: 'Order Placed'
            };
        }));

        // 2. Calculate Subtotal
        const itemTotal = itemsWithVendor.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        // --- 3. DYNAMIC DELIVERY CHARGE LOGIC (5%) ---
        // We calculate 5% of the itemTotal
        const DELIVERY_CHARGE = itemTotal * 0.05; 

        // 4. Calculate Final Total (Items + Delivery)
        const totalAmount = itemTotal + DELIVERY_CHARGE;

        const newOrder = await Order.create({
            user: req.user._id,
            items: itemsWithVendor,
            deliveryCharge: DELIVERY_CHARGE, // Stores the 5% value
            totalAmount: totalAmount,         // Total amount customer pays
            shippingAddress: {
                phoneNumber: shippingAddress.phoneNumber,
                addressLine: shippingAddress.addressLine,
                city: shippingAddress.city || "Pokhara",
                landmark: shippingAddress.landmark,
                coordinates: {
                    lat: shippingAddress.coordinates?.lat || (Array.isArray(shippingAddress.coordinates) ? shippingAddress.coordinates[0] : null),
                    lng: shippingAddress.coordinates?.lng || (Array.isArray(shippingAddress.coordinates) ? shippingAddress.coordinates[1] : null)
                }
            },
            paymentDetails: {
                method: paymentDetails?.method || 'COD',
                status: 'Pending',
            }
        });

        // Clear cart after successful order creation
        await Cart.findOneAndDelete({ user: req.user._id }); 
        
        res.status(201).json({ success: true, order: newOrder });

    } catch (error) {
        console.error("Order Creation Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
// 2. Get Vendor's Specific Orders (Vendor Side)
exports.getVendorOrders = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const vendorId = new mongoose.Types.ObjectId(req.user._id); 

        const orders = await Order.find({ "items.vendor": vendorId })
            .populate('user', 'fullName phoneNumber email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Get Single Order Details (Shared)
exports.getOrderDetails = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'fullName email phoneNumber')
            .populate('items.product');

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        const userId = req.user._id.toString();
        const isCustomer = order.user._id.toString() === userId;
        const isAdmin = req.user.role === 'admin';
        
        const isVendorInvolved = order.items.some(item => 
            item.vendor && item.vendor.toString() === userId
        );

        if (!isCustomer && !isAdmin && !isVendorInvolved) {
            return res.status(403).json({ success: false, message: "Unauthorized access to this order" });
        }

        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error("Single Order Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Get Logged-in Customer's Orders
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: orders.length, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getDeliveryBoyOrders = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 1. Get ALL orders associated with this rider (for History & Chart)
    // We fetch everything but sort by newest first
    const allRiderOrders = await Order.find({ 
      deliveryBoy: req.user._id 
    })
    .populate('user', 'fullName')
    .sort({ createdAt: -1 });

    // 2. Separate Active vs Completed for the Stats
    const activeOrders = allRiderOrders.filter(o => o.shippingStatus !== "Delivered");
    
    const completedOrdersToday = allRiderOrders.filter(o => 
      o.shippingStatus === "Delivered" && 
      o.updatedAt >= startOfToday
    );

    const allCompletedOrders = allRiderOrders.filter(o => o.shippingStatus === "Delivered");

    // 3. Calculate Total Earnings (95% Payout)
    const totalEarnings = allCompletedOrders.reduce((sum, order) => {
      return sum + (order.deliveryCharge * 0.95);
    }, 0);

    // 4. Send comprehensive data to frontend
    res.status(200).json({
      success: true,
      orders: allRiderOrders, // Send all orders so the Earnings History/Chart can be built
      stats: {
        pendingDeliveries: activeOrders.length,
        completedToday: completedOrdersToday.length,
        totalEarnings: Math.round(totalEarnings),
        // Adding this helps the frontend show total payouts vs current balance
        totalWithdrawn: req.user.totalWithdrawn || 0 
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Controller to handle Admin assigning a rider to an order
exports.dispatchOrder = async (req, res) => {
  try {
    const { orderId, deliveryBoyId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.deliveryBoy = deliveryBoyId;
    order.orderStatus = "Dispatched"; 
    order.shippingStatus = "On the Way"; 
    order.dispatchedAt = Date.now();

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order successfully assigned to rider",
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateLocation = async (req, res) => {
  const User = require("../../model/userModel"); // Ensure User model is available
  await User.findByIdAndUpdate(req.user._id, {
    currentLocation: {
      lat: req.body.lat,
      lng: req.body.lng,
      updatedAt: Date.now()
    }
  });
  res.status(200).json({ success: true });
};

exports.getActiveOrder = async (req, res) => {
    try {
        const order = await Order.findOne({
            user: req.user._id,
            orderStatus: { $in: ["Dispatched", "Out for Delivery"] },
            shippingStatus: { $ne: "Delivered" } 
        })
        .populate({
            path: "deliveryBoy",
            select: "fullName phoneNumber currentLocation"
        })
        .sort({ createdAt: -1 });

        if (!order) {
            return res.status(200).json({ success: false, message: "No active delivery found" });
        }

        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSingleOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate("user", "fullName email");
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Update Order Status (Rider Actions)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        
        if (order.deliveryBoy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "You are not authorized to update this order" });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            {
                $set: {
                    orderStatus: 'Delivered',
                    shippingStatus: 'Delivered',
                    "paymentDetails.status": "Completed" 
                }
            },
            { new: true }
        );

        res.status(200).json({ success: true, order: updatedOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};