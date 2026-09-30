import mongoose from 'mongoose';

const HistorySchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: false,
    },
    phoneNumber: {
      type: String,
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
    },
    crop: {
      type: String,
      default: '',
    },
    details: {
      type: String,
      default: '',
    },
    amount: {
      type: Number,
      default: null,
    },
    type: {
      type: String,
      default: 'activity', // 'activity' | 'expense' | 'income'
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.models.History || mongoose.model('History', HistorySchema);
