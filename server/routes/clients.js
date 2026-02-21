import express from 'express';
import Client from '../models/Client.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/clients
// @desc    Get all clients
// @access  Private
router.get('/', async (req, res) => {
  try {
    const clients = await Client.find().populate('city').sort({ name: 1 });
    res.json({ success: true, data: clients });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/clients
// @desc    Create a client
// @access  Private
router.post('/', async (req, res) => {
  try {
    const client = await Client.create(req.body);
    const populatedClient = await Client.findById(client._id).populate('city');
    res.status(201).json({ success: true, data: populatedClient });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/clients/:id
// @desc    Update a client
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('city');

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json({ success: true, data: client });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/clients/:id
// @desc    Delete a client
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json({ success: true, message: 'Client deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
