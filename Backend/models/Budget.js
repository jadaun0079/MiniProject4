const mongoose = require('mongoose');

const budgetSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Please specify a category for this budget'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please specify a budget limit amount'],
      min: [1, 'Budget must be at least 1'],
    },
    period: {
      type: String,
      enum: ['monthly'],
      default: 'monthly',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one budget per category per user
budgetSchema.index({ user: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
