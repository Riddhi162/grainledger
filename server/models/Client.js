import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true
  },
  city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City',
    required: [true, 'City is required']
  },
  isFarmer: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Client = mongoose.model('Client', clientSchema);

export default Client;
