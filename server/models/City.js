import mongoose from 'mongoose';

const citySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'City name is required'],
    trim: true,
    unique: true
  },
  stdCode: {
    type: String,
    trim: true
  },
  postalCode: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const City = mongoose.model('City', citySchema);

export default City;
