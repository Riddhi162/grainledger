import express from 'express';
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/transactions/next-number
// @desc    Get next transaction number for current year
// @access  Private
router.get('/next-number', async (req, res) => {
  try {
    const currentYear = 2026;
    const nextYear = 27;
    // Find the highest sequence number for current year
    const lastTransaction = await Transaction.findOne({ year: currentYear })
      .sort({ sequenceNumber: -1 });
    
    const nextSequence = lastTransaction ? lastTransaction.sequenceNumber + 1 : 1;
    const transactionNumber = `${currentYear}-${nextYear}-${nextSequence}`;
    
    res.json({ 
      success: true, 
      data: {
        transactionNumber,
        year: currentYear,
        sequenceNumber: nextSequence
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/transactions
// @desc    Get all transactions with filters
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, client, limit = 100 } = req.query;
    
    let query = {};
    
    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    // Client filter (purchaser or buyer)
    if (client) {
      query.$or = [
        { purchaserName: client },
        { buyerName: client }
      ];
    }
    
    const transactions = await Transaction.find(query)
      .populate('purchaserName')
      .populate('purchaserCity')
      .populate('buyerName')
      .populate('buyerCity')
      .populate('itemName')
      .sort({ date: -1 })
      .limit(parseInt(limit));
    
    res.json({ success: true, data: transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/transactions/daily/:date
// @desc    Get transactions for a specific date
// @access  Private
router.get('/daily/:date', async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const transactions = await Transaction.find({
      date: {
        $gte: date,
        $lt: nextDay
      }
    })
      .populate('purchaserName')
      .populate('purchaserCity')
      .populate('buyerName')
      .populate('buyerCity')
      .populate('itemName')
      .sort({ createdAt: 1 });
    
    res.json({ success: true, data: transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/transactions/party/:clientId
// @desc    Get transactions for a specific party (client)
// @access  Private
router.get('/party/:clientId', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const clientId = req.params.clientId;
    
    let query = {
      $or: [
        { purchaserName: clientId },
        { buyerName: clientId }
      ]
    };
    
    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const transactions = await Transaction.find(query)
      .populate('purchaserName')
      .populate('purchaserCity')
      .populate('buyerName')
      .populate('buyerCity')
      .populate('itemName')
      .sort({ date: 1 });
    
    res.json({ success: true, data: transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/transactions/:id
// @desc    Get single transaction
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('purchaserName')
      .populate('purchaserCity')
      .populate('buyerName')
      .populate('buyerCity')
      .populate('itemName');
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json({ success: true, data: transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/transactions
// @desc    Create a transaction
// @access  Private
router.post('/', async (req, res) => {
  try {
    const currentYear = 2026;
    const nextYear = 27;
    // Find the highest sequence number for current year
    const lastTransaction = await Transaction.findOne({ year: currentYear })
      .sort({ sequenceNumber: -1 });
    
    const sequenceNumber = lastTransaction ? lastTransaction.sequenceNumber + 1 : 1;
    const transactionNumber = `${currentYear}-${nextYear}-${sequenceNumber}`;
    
    // Create transaction with auto-generated number
    const transactionData = {
      ...req.body,
      transactionNumber,
      year: currentYear,
      sequenceNumber
    };
    
    const transaction = await Transaction.create(transactionData);
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('purchaserName')
      .populate('purchaserCity')
      .populate('buyerName')
      .populate('buyerCity')
      .populate('itemName');
    
    res.status(201).json({ success: true, data: populatedTransaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/transactions/:id
// @desc    Update a transaction
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    // Don't allow updating transaction number, year, or sequence
    const { transactionNumber, year, sequenceNumber, ...updateData } = req.body;
    
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    )
      .populate('purchaserName')
      .populate('purchaserCity')
      .populate('buyerName')
      .populate('buyerCity')
      .populate('itemName');
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json({ success: true, data: transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/transactions/:id
// @desc    Delete a transaction
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json({ success: true, message: 'Transaction deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
