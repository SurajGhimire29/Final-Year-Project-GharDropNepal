const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transactionId: { 
    type: String, 
    unique: true,
    sparse: true // Allows null for pending payments
  },
  pidx: { 
    type: String, // Specifically for Khalti's unique identifier
    unique: true 
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['Khalti', 'eSewa', 'COD'],
    default: 'Khalti'
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  rawResponse: {
    type: Object // Stores the full JSON response from Khalti for debugging
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);