import mongoose from 'mongoose';

const DailyPlanSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      index: true,
    },
    dateKey: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    crop: {
      type: String,
      required: true,
    },
    daysSinceSowing: {
      type: Number,
      default: 15,
    },
    weatherSummary: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      default: 'en',
      index: true,
    },
    tasks: [
      {
        id: Number,
        task: String,
        time: String,
        category: String,
        completed: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

DailyPlanSchema.index({ phoneNumber: 1, dateKey: 1, language: 1 });

export default mongoose.models.DailyPlan || mongoose.model('DailyPlan', DailyPlanSchema);
