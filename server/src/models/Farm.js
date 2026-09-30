import mongoose from 'mongoose';

const FarmSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: true,
    },
    totalAcreage: {
      type: Number,
      default: 0,
    },
    primaryCrop: {
      type: String,
      default: '',
    },
    currentSeason: {
      type: String,
      default: '',
    },
    irrigationType: {
      type: String,
      default: '',
    },
    budget: {
      crop: { type: String, default: 'Paddy' },
      acres: { type: Number, default: 1 },
      seeds: { type: Number, default: 1200 },
      fertilizer: { type: Number, default: 3500 },
      labor: { type: Number, default: 4000 },
      water: { type: Number, default: 1500 },
      other: { type: Number, default: 1000 },
      total: { type: Number, default: 11200 },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Farm || mongoose.model('Farm', FarmSchema);
