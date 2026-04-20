const axios = require('axios');
const Order = require('../../model/orderModel');
const Payment = require('../../model/paymentModel');

// Use the Gateway URL from your .env or fallback to the Dev one
const KHALTI_INITIATE_URL = process.env.KHALTI_GATEWAY_URL || 'https://a.khalti.com/api/v2/epayment/initiate/';
const KHALTI_LOOKUP_URL = 'https://a.khalti.com/api/v2/epayment/lookup/';

const initiateKhaltiPayment = async (req, res) => {
    try {
        const { orderId } = req.body;
        const user = req.user;

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        const khaltiPayload = {
            return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-status`,
            website_url: process.env.FRONTEND_URL || 'http://localhost:5173',
            amount: Math.round(order.totalAmount * 100), // Rs to Paisa
            purchase_order_id: order._id.toString(),
            purchase_order_name: `GharDrop Order #${order._id.toString().slice(-5)}`,
            customer_info: {
                name: user?.fullName || "Guest Customer",
                email: user?.email || "customer@ghardrop.com",
                phone: String(order.shippingAddress?.phoneNumber || "9800000000")
            }
        };

        const response = await axios.post(KHALTI_INITIATE_URL, khaltiPayload, {
            headers: {
                // This uses the "Key 981ff..." string directly from your .env
                Authorization: process.env.KHALTI_SECRET_KEY, 
                'Content-Type': 'application/json',
            },
        });

        if (response.data.pidx) {
            // Create the audit record in your new Payment model
            await Payment.create({
                orderId: order._id,
                userId: user._id,
                pidx: response.data.pidx,
                amount: order.totalAmount,
                paymentMethod: 'Khalti',
                status: 'Pending'
            });

            // Update the Order status to indicate a payment is in progress
            order.paymentDetails.pidx = response.data.pidx;
            order.paymentDetails.method = 'Khalti';
            await order.save();

            return res.status(200).json({
                success: true,
                payment_url: response.data.payment_url,
                pidx: response.data.pidx
            });
        }
    } catch (error) {
        console.error("Khalti Error:", error.response?.data || error.message);
        res.status(500).json({ 
            success: false, 
            message: error.response?.data?.detail || "Khalti connection failed" 
        });
    }
};

const verifyKhaltiPayment = async (req, res) => {
    try {
        const { pidx } = req.body; 

        const response = await axios.post(KHALTI_LOOKUP_URL, { pidx }, {
            headers: {
                Authorization: process.env.KHALTI_SECRET_KEY,
                'Content-Type': 'application/json',
            },
        });

        if (response.data.status === 'Completed') {
            const paymentUpdate = await Payment.findOneAndUpdate(
                { pidx },
                { status: 'Completed', transactionId: response.data.transaction_id },
                { new: true }
            );

            await Order.findByIdAndUpdate(paymentUpdate.orderId, {
                $set: {
                    "paymentDetails.status": "Completed",
                    "paymentDetails.transactionId": response.data.transaction_id,
                    "shippingStatus": "Processing",
                    "isPaid": true 
                }
            });

            return res.json({ success: true, message: "Payment Verified" });
        }
        
        res.status(400).json({ success: false, message: "Payment not completed" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Verification failed" });
    }
};

module.exports = { initiateKhaltiPayment, verifyKhaltiPayment };