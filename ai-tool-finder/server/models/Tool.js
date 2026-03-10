import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema(
  {
    searches: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    recentBoost: { type: Number, default: 0 },
  },
  { _id: false }
);

const toolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    tags: [{ type: String }],
    website: { type: String, required: true },
    pricing: { type: String, default: 'unknown' },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    embedding: [{ type: Number }],
    analytics: { type: analyticsSchema, default: () => ({}) },
    lastLaunchedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

toolSchema.virtual('trendingScore').get(function trendingScore() {
  return this.analytics.clicks + this.analytics.searches + this.analytics.recentBoost;
});

export default mongoose.model('Tool', toolSchema);
