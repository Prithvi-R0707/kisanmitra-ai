import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema(
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
    category: {
      type: String,
      enum: ['seeds', 'fertilizer', 'pesticide', 'labor', 'machinery', 'fuel', 'irrigation', 'other'],
      default: 'other',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);
