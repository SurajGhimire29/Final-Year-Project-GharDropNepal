const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    
    shippingAddress: {
        phoneNumber: { type: String, required: true },
        city: { type: String, default: "Pokhara" },
        addressLine: { type: String, required: true },
        landmark: { type: String },
        coordinates: {
            lat: { type: Number },
            lng: { type: Number }
        }
    },

    items: [{
        product: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Product', 
            required: true
        },
        vendor: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        }, 
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: [1, 'Quantity cannot be less than 1'] },
        price: { type: Number, required: true }, // Price per unit
        image: { type: String },
        itemStatus: { 
            type: String, 
            enum: ['Order Placed', 'Processing', 'Ready for Pickup', 'Out for Delivery', 'Delivered', 'Cancelled'], 
            default: 'Order Placed' 
        }
    }],

    // --- FINANCIAL FIELDS ---
    // The cost of items ONLY (e.g., Rs. 800)
    itemsPrice: { 
        type: Number, 
        required: true, 
        default: 0 
    },
    
    // The delivery fee ONLY (e.g., Rs. 40)
    deliveryCharge: { 
        type: Number, 
        required: true, 
        default: 0 
    }, 

    // Total collected from customer (itemsPrice + deliveryCharge) (e.g., Rs. 840)
    totalAmount: { 
        type: Number, 
        required: true 
    }, 

    paymentDetails: {
        pidx: { type: String }, 
        transactionId: { type: String }, 
        method: { 
            type: String, 
            enum: ['Khalti', 'COD', 'Esewa'], 
            default: 'COD' 
        },
        status: { 
            type: String, 
            enum: ['Pending', 'Completed', 'Failed', 'Refunded'], 
            default: 'Pending' 
        }
    },

    orderStatus: { 
        type: String, 
        enum: ['Pending', 'Processing', 'Dispatched', 'Out for Delivery', 'Delivered', 'Cancelled'], 
        default: 'Pending' 
    },

    shippingStatus: { 
        type: String, 
        enum: ['Order Placed', 'Processing', 'On the Way', 'Delivered', 'Cancelled'], 
        default: 'Order Placed' 
    },

    deliveryBoy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    
    orderedAt: { type: Date, default: Date.now },
    dispatchedAt: { type: Date },
    deliveredAt: { type: Date } // Useful for calculating "Time to Deliver" in Pokhara
}, { 
    timestamps: true 
});

// Indexes for performance
orderSchema.index({ "items.vendor": 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ deliveryBoy: 1 }); // Added index for rider performance tracking

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;