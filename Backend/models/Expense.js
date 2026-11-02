const mongoose = require('mongoose');

const expenseSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
    },
    type: {
      type: String,
      enum: ['expense', 'income'],
      default: 'expense',
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please add a valid amount'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'UPI', 'Other'],
      default: 'Credit Card',
    },
    date: {
      type: Date,
      required: [true, 'Please select a date'],
      default: Date.now,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description or title'],
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimal filtering and aggregation performance
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, type: 1, date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);