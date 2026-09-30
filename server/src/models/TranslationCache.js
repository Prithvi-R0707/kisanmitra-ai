import mongoose from 'mongoose';

const TranslationCacheSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, index: true },
    language: { type: String, required: true, index: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

TranslationCacheSchema.index({ key: 1, language: 1 }, { unique: true });

export default mongoose.models.TranslationCache || mongoose.model('TranslationCache', TranslationCacheSchema);
