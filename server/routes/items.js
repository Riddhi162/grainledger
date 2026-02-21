import express from 'express';
import Item from '../models/Item.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/items
// @desc    Get all items
// @access  Private
router.get('/', async (req, res) => {
  try {
    const items = await Item.find().sort({ name: 1 });
    res.json({ success: true, data: items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/items
// @desc    Create an item
// @access  Private
router.post('/', async (req, res) => {
  try {
    const item = await Item.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Item already exists' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/items/:id
// @desc    Update an item
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/items/:id
// @desc    Delete an item
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
