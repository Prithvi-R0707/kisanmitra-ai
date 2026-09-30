import mongoose from 'mongoose';

const SoilSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: true,
    },
    color: {
      type: String,
      default: '',
    },
    texture: {
      type: String,
      default: '',
    },
    waterHolding: {
      type: String,
      default: '',
    },
    soilType: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Soil || mongoose.model('Soil', SoilSchema);
