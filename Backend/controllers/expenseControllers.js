const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

// Lazy load GoogleGenAI safely
let GoogleGenAI;
try {
  GoogleGenAI = require('@google/genai').GoogleGenAI;
} catch (e) {
  GoogleGenAI = null;
}

// @desc    Get all transactions with search, filter, sort, and pagination
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      search,
      category,
      type,
      paymentMethod,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 50,
    } = req.query;

    const query = { user: userId };

    // Search query on description or notes
    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ description: regex }, { notes: regex }];
    }

    // Category filter
    if (category && category !== 'All' && category !== '') {
      query.category = category;
    }

    // Type filter (income vs expense)
    if (type && type !== 'all' && (type === 'income' || type === 'expense')) {
      query.type = type;
    }

    // Payment method filter
    if (paymentMethod && paymentMethod !== 'All' && paymentMethod !== '') {
      query.paymentMethod = paymentMethod;
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Sorting
    const sortField = ['date', 'amount', 'category', 'description'].includes(sortBy)
      ? sortBy
      : 'date';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortDirection };

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const total = await Expense.countDocuments(query);
    const transactions = await Expense.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      transactions,
      meta: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new transaction (income or expense)
// @route   POST /api/expenses
// @access  Private
const addExpense = async (req, res) => {
  try {
    const {
      amount,
      category,
      date,
      description,
      type = 'expense',
      paymentMethod = 'Credit Card',
      notes = '',
    } = req.body;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Please provide a valid positive amount' });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({ message: 'Please select a category' });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Please add a description or title' });
    }

    const transaction = await Expense.create({
      user: req.user._id,
      amount: Math.round(Number(amount) * 100) / 100,
      type: type === 'income' ? 'income' : 'expense',
      category: category.trim(),
      paymentMethod: paymentMethod || 'Credit Card',
      date: date ? new Date(date) : new Date(),
      description: description.trim(),
      notes: notes ? notes.trim() : '',
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update transaction
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
  try {
    const transaction = await Expense.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Verify ownership
    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this record' });
    }

    const { amount, category, date, description, type, paymentMethod, notes } = req.body;

    if (amount !== undefined) {
      if (isNaN(amount) || Number(amount) <= 0) {
        return res.status(400).json({ message: 'Amount must be a positive number' });
      }
      transaction.amount = Math.round(Number(amount) * 100) / 100;
    }

    if (category) transaction.category = category.trim();
    if (description) transaction.description = description.trim();
    if (date) transaction.date = new Date(date);
    if (type) transaction.type = type === 'income' ? 'income' : 'expense';
    if (paymentMethod) transaction.paymentMethod = paymentMethod;
    if (notes !== undefined) transaction.notes = notes.trim();

    const updated = await transaction.save();
    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
  try {
    const transaction = await Expense.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this record' });
    }

    await transaction.deleteOne();
    res.status(200).json({ id: req.params.id, message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get authoritative financial summary calculated from database
// @route   GET /api/expenses/summary
// @access  Private
const getFinancialSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    const matchStage = { user: userId };
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchStage.date.$lte = end;
      }
    }

    const totals = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpenses = 0;
    let transactionCount = 0;

    totals.forEach((item) => {
      transactionCount += item.count;
      if (item._id === 'income') {
        totalIncome = Math.round(item.total * 100) / 100;
      } else {
        totalExpenses = Math.round(item.total * 100) / 100;
      }
    });

    const netBalance = Math.round((totalIncome - totalExpenses) * 100) / 100;
    const savingsRate =
      totalIncome > 0
        ? Math.max(0, Math.round(((totalIncome - totalExpenses) / totalIncome) * 1000) / 10)
        : 0;

    // Highest spending category
    const topCategoryAgg = await Expense.aggregate([
      { $match: { user: userId, type: 'expense' } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
      { $limit: 1 },
    ]);

    const topCategory = topCategoryAgg[0]
      ? { name: topCategoryAgg[0]._id, amount: Math.round(topCategoryAgg[0].total * 100) / 100 }
      : null;

    res.status(200).json({
      totalIncome,
      totalExpenses,
      netBalance,
      savingsRate,
      transactionCount,
      topCategory,
    });
  } catch (error) {
    console.error('Error calculating summary:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get detailed analytics and trends
// @route   GET /api/expenses/analytics
// @access  Private
const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Category breakdown for expenses
    const categoryBreakdown = await Expense.aggregate([
      { $match: { user: userId, type: 'expense' } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const totalExpenseSum = categoryBreakdown.reduce((sum, item) => sum + item.total, 0);
    const categoryData = categoryBreakdown.map((item) => ({
      name: item._id,
      value: Math.round(item.total * 100) / 100,
      count: item.count,
      percentage: totalExpenseSum > 0 ? Math.round((item.total / totalExpenseSum) * 1000) / 10 : 0,
    }));

    // 2. Monthly cash flow over the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyAgg = await Expense.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthsMap = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Pre-populate last 6 calendar months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear() % 100}`;
      monthsMap[key] = { label, income: 0, expense: 0, net: 0 };
    }

    monthlyAgg.forEach((item) => {
      const key = `${item._id.year}-${item._id.month}`;
      if (monthsMap[key]) {
        const amt = Math.round(item.total * 100) / 100;
        if (item._id.type === 'income') {
          monthsMap[key].income += amt;
        } else {
          monthsMap[key].expense += amt;
        }
        monthsMap[key].net = Math.round((monthsMap[key].income - monthsMap[key].expense) * 100) / 100;
      }
    });

    const monthlyTrends = Object.values(monthsMap);

    // 3. Payment method breakdown
    const paymentMethods = await Expense.aggregate([
      { $match: { user: userId, type: 'expense' } },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const paymentMethodData = paymentMethods.map((pm) => ({
      name: pm._id || 'Other',
      total: Math.round(pm.total * 100) / 100,
      count: pm.count,
    }));

    res.status(200).json({
      categoryBreakdown: categoryData,
      monthlyTrends,
      paymentMethodBreakdown: paymentMethodData,
    });
  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export transactions to CSV
// @route   GET /api/expenses/export
// @access  Private
const exportExpensesCSV = async (req, res) => {
  try {
    const transactions = await Expense.find({ user: req.user._id }).sort({ date: -1 });

    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Payment Method', 'Notes'];
    const rows = transactions.map((t) => [
      new Date(t.date).toISOString().split('T')[0],
      t.type,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.amount.toFixed(2),
      `"${(t.paymentMethod || '').replace(/"/g, '""')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions_export.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get expense insights using Gemini AI or Smart Financial Rules Fallback
// @route   GET /api/expenses/insights
// @access  Private
const getExpenseInsights = async (req, res) => {
  try {
    const transactions = await Expense.find({ user: req.user._id }).sort({ date: -1 });

    if (!transactions || transactions.length === 0) {
      return res.status(200).json({
        insights:
          "You haven't recorded any transactions yet. Add your income and expenses to receive real-time, personalized financial analytics and AI insights!",
      });
    }

    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const categoryTotals = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((exp) => {
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
      });

    const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const topCategory = sortedCategories[0] || ['None', 0];
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0;

    // Check if Gemini API key exists
    if (process.env.GEMINI_API_KEY && GoogleGenAI) {
      try {
        const categoriesStr = sortedCategories
          .map(([cat, amt]) => `- ${cat}: $${amt.toFixed(2)}`)
          .join('\n');

        const prompt = `Act as an expert financial advisor for an expense tracker application.
User Financial Metrics:
- Total Income: $${totalIncome.toFixed(2)}
- Total Expenses: $${totalExpenses.toFixed(2)}
- Net Cashflow: $${netSavings.toFixed(2)}
- Savings Rate: ${savingsRate}%
- Expense Breakdown:
${categoriesStr || 'No category expenses recorded'}

Provide a structured, encouraging 3-paragraph financial briefing:
1. Executive Assessment: Clear overview of current cashflow health and savings rate.
2. Spending Opportunities: Highlight the highest cost centers (especially ${topCategory[0]}) with 2 actionable optimization tips.
3. Proactive Strategy: One forward-looking suggestion for automated budgeting and emergency reserve building. Keep tone modern, concise, and professional.`;

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        if (response && response.text) {
          return res.status(200).json({ insights: response.text });
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, using intelligent financial rule engine:', geminiError.message);
      }
    }

    // High quality intelligent financial rule engine (Rule-based Fallback)
    const ruleBasedInsights = `**Financial Health Assessment**
Your total recorded income stands at $${totalIncome.toFixed(2)} with total expenditures of $${totalExpenses.toFixed(2)}, producing a net cashflow of $${netSavings.toFixed(2)} (Savings rate: ${savingsRate}%). ${
      netSavings >= 0
        ? 'You are maintaining a positive cashflow, which puts you in an excellent position to accelerate long-term wealth building.'
        : 'Your expenditures currently outpace your inflows. Reviewing non-essential discretionary categories will help restore positive monthly margins.'
    }

**Top Expense Analysis**
Your primary expenditure center is **${topCategory[0]}**, accounting for $${topCategory[1].toFixed(2)}${
      totalExpenses > 0 ? ` (${((topCategory[1] / totalExpenses) * 100).toFixed(0)}% of total expenses)` : ''
    }. Focusing budgeting efforts here will provide the highest leverage for your savings. Consider setting a dedicated monthly ceiling for this category.

**Next Steps & Recommendation**
Aim to maintain an emergency buffer covering 3 to 6 months of baseline living costs. Automate transfers of at least 15-20% of incoming deposits directly into high-yield savings to preserve your wealth trajectory.`;

    res.status(200).json({ insights: ruleBasedInsights });
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({ message: 'Failed to generate financial insights' });
  }
};

module.exports = {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getFinancialSummary,
  getAnalytics,
  exportExpensesCSV,
  getExpenseInsights,
};