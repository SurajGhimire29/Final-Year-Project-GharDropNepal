const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  rider: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: false 
  },
  vendor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: false 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    // Added 'Completed' to match your Frontend and Controller logic
    enum: ['Pending', 'Approved', 'Rejected', 'Completed', 'Unpaid'], 
    default: 'Pending' 
  },
  type: {
    type: String,
    enum: ['Payout', 'Banner Fee'],
    default: 'Payout'
  },
  requestedAt: { 
    type: Date, 
    default: Date.now 
  },
  // Changed to paidAt to match your updateWithdrawalStatus controller
  paidAt: { 
    type: Date 
  },
  processedAt: { 
    type: Date 
  }
});

module.exports = mongoose.model('Withdrawal', withdrawalSchema);