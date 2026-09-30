import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
    },
    phoneNumber: {
      type: String,
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: 'en',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Chat || mongoose.model('Chat', ChatSchema);
