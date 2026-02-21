import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  transactionNumber: {
    type: String,
    required: true,
    unique: true
    // Format: Tr2026-1, Tr2026-2, etc.
  },
  year: {
    type: Number,
    required: true
  },
  sequenceNumber: {
    type: Number,
    required: true
  },
  purchaserName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Purchaser name is required']
  },
  purchaserCity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City',
    required: [true, 'Purchaser city is required']
  },
  buyerName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Buyer name is required']
  },
  buyerCity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City',
    required: [true, 'Buyer city is required']
  },
  itemName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: [true, 'Item name is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: 0
  },
  unit: {
    type: String,
    enum: ['bag', 'katta'],
    required: [true, 'Unit is required']
  },
  ratePerUnit: {
    type: Number,
    required: [true, 'Rate per unit is required'],
    min: 0
  },
  grainTradeType: {
    type: String,
    trim: true
  },
  dalaliRatePerKatta: {
    type: Number,
    required: [true, 'Dalali rate per katta is required'],
    min: 0
  },
  dalaliKattaWeight: {
    type: String,
    enum: ['20kg', '50kg', '100kg'],
    required: [true, 'Dalali katta weight is required']
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
    // Calculated as: dalaliRatePerKatta * quantity
  },
  tradeConditions: {
    type: String,
    trim: true,
    default: ''
  },
  tradeMethod: {
    type: String,
    enum: ['phone', 'in-person', 'paper'],
    required: [true, 'Trade method is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
transactionSchema.index({ year: 1, sequenceNumber: 1 });
transactionSchema.index({ date: 1 });
transactionSchema.index({ purchaserName: 1 });
transactionSchema.index({ buyerName: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
