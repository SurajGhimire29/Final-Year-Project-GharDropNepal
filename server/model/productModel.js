const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter product name"],
    trim: true,
    maxLength: [100, "Product name cannot exceed 100 characters"]
  },
  description: {
    type: String,
    required: [true, "Please enter product description"]
  },
  price: {
    type: Number,
    required: [true, "Please enter product price"],
    default: 0.0
  },
discountPercentage: {
    type: Number,
    default: 0
},
discountPrice: {
    type: Number
},
  unit: {
    type: String,
    required: [false, "Please Provide Unit If Needed"],
    enum: {
        values: ['kg', 'gram', 'piece', 'pkt', 'litre'],
        message: "Please select correct unit"
    }
  },
  images: [
    {
      public_id: { type: String, required: true },
      url: { type: String, required: true }
    }
  ],
  category: {
    type: String,
    required: [true, "Please select category for this product"],
    enum: {
      values: ['Vegetables', 'Fruits', 'Dairy', 'Organic', 'Meat', 'Bakery', 'Staples'],
      message: "Please select correct category"
    }
  },
  stock: {
    type: Number,
    required: [true, "Please enter product stock"],
    default: 0
  },
  tag: {
    type: String,
    default: "Fresh"
  },
  isFestivalOffer: {
    type: Boolean,
    default: false
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      rating: {
        type: Number,
        required: true
      },
      comment: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Product", productSchema);