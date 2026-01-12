import mongoose from 'mongoose';

const supportContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const SupportContact = mongoose.model('SupportContact', supportContactSchema);

export default SupportContact;