import express from 'express';
import City from '../models/City.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/cities
// @desc    Get all cities
// @access  Private
router.get('/', async (req, res) => {
  try {
    const cities = await City.find().sort({ name: 1 });
    res.json({ success: true, data: cities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/cities
// @desc    Create a city
// @access  Private
router.post('/', async (req, res) => {
  try {
    const city = await City.create(req.body);
    console.log('City created:', city);
    res.status(201).json({ success: true, data: city });
  } catch (error) {
    if (error.code === 11000) {
      // City already exists, try to find and return it
      const existingCity = await City.findOne({ name: req.body.name });
      if (existingCity) {
        return res.status(200).json({ success: true, data: existingCity, message: 'City already exists' });
      }
      return res.status(400).json({ message: 'City already exists' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/cities/:id
// @desc    Update a city
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const city = await City.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }

    res.json({ success: true, data: city });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/cities/:id
// @desc    Delete a city
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const city = await City.findByIdAndDelete(req.params.id);

    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }

    res.json({ success: true, message: 'City deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
