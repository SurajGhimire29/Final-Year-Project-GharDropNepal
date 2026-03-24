const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One user = One cart
  },
  items: [
    {
      product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: [true, "Please enter quantity"],
        min: [1, "Quantity cannot be less than 1"],
        default: 1
      },
      price: {
        type: Number,
        required: true
      },
      image: {
        type: String, // Storing the primary image URL for quick display
        required: true
      },
      unit: {
        type: String,
        required: true
      }
    }
  ],
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Pre-save middleware to calculate total price automatically
// Replace your old pre-save with this
cartSchema.pre('save', async function() {
    // No 'next' argument used here
    this.totalPrice = this.items.reduce((acc, item) => {
        return acc + (item.price * item.quantity);
    }, 0);
    
    this.updatedAt = Date.now();
    // No need to call next() if using an async function
});
module.exports = mongoose.model("Cart", cartSchema);