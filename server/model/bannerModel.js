const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    badge: {
        type: String,
        required: [true, "Please provide a badge text (e.g., 'Limited Offer')"],
        trim: true
    },
    title: {
        type: String,
        required: [true, "Please provide a banner title"],
        trim: true
    },
    desc: {
        type: String,
        required: [true, "Please provide a description"]
    },
    image: {
        type: String, 
        required: [true, "Please provide an image URL"]
    },
    // --- NEW FIELDS FOR VENDOR INTEGRATION ---
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Links to your User model
        default: null // Null if created by Admin directly
    },
    shopName: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending" 
    },
    // ------------------------------------------
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Banner = mongoose.model("Banner", bannerSchema);
module.exports = Banner;