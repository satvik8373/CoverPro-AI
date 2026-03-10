import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['search', 'click', 'time_spent'],
      required: true,
    },
    term: { type: String, default: null },
    toolId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tool', default: null },
    value: { type: Number, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model('Analytics', analyticsSchema);
