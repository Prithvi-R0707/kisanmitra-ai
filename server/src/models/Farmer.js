import mongoose from 'mongoose';

const FarmerSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    village: {
      type: String,
      trim: true,
      default: '',
    },
    district: {
      type: String,
      trim: true,
      default: '',
    },
    state: {
      type: String,
      trim: true,
      default: '',
    },
    selectedLanguage: {
      code: { type: String, default: 'en' },
      name: { type: String, default: 'English' },
      nativeName: { type: String, default: 'English' },
    },
    isRegistered: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Farmer || mongoose.model('Farmer', FarmerSchema);
