const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

// @desc    Get all budgets with real-time calculated spending for the current month
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user's defined budgets
    const budgets = await Budget.find({ user: userId }).sort({ createdAt: -1 });

    // Determine current month range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Calculate actual expenses for each category in current month
    const categorySpending = await Expense.aggregate([
      {
        $match: {
          user: userId,
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amount' },
        },
      },
    ]);

    const spendingMap = {};
    categorySpending.forEach((item) => {
      spendingMap[item._id] = Math.round(item.totalSpent * 100) / 100;
    });

    const enrichedBudgets = budgets.map((b) => {
      const spent = spendingMap[b.category] || 0;
      const remaining = Math.round((b.amount - spent) * 100) / 100;
      const percentage = b.amount > 0 ? Math.round((spent / b.amount) * 1000) / 10 : 0;
      let status = 'safe';
      if (percentage >= 100) {
        status = 'exceeded';
      } else if (percentage >= 75) {
        status = 'warning';
      }

      return {
        _id: b._id,
        category: b.category,
        amount: b.amount,
        period: b.period,
        spent,
        remaining,
        percentage,
        status,
        createdAt: b.createdAt,
      };
    });

    res.status(200).json(enrichedBudgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a category budget
// @route   POST /api/budgets
// @access  Private
const createBudget = async (req, res) => {
  try {
    const { category, amount, period = 'monthly' } = req.body;

    if (!category || !category.trim()) {
      return res.status(400).json({ message: 'Category is required' });
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    const trimmedCat = category.trim();

    // Check if budget for this category already exists
    const existing = await Budget.findOne({ user: req.user._id, category: trimmedCat });
    if (existing) {
      return res.status(400).json({
        message: `A budget for category "${trimmedCat}" already exists. Please edit the existing budget.`,
      });
    }

    const budget = await Budget.create({
      user: req.user._id,
      category: trimmedCat,
      amount: Math.round(Number(amount) * 100) / 100,
      period,
    });

    res.status(201).json(budget);
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    if (budget.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this budget' });
    }

    const { amount, category } = req.body;

    if (amount !== undefined) {
      if (isNaN(amount) || Number(amount) <= 0) {
        return res.status(400).json({ message: 'Amount must be a positive number' });
      }
      budget.amount = Math.round(Number(amount) * 100) / 100;
    }

    if (category && category.trim()) {
      budget.category = category.trim();
    }

    const updated = await budget.save();
    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    if (budget.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this budget' });
    }

    await budget.deleteOne();
    res.status(200).json({ id: req.params.id, message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
};
