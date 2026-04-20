const Expense = require('../models/Expense');
const { GoogleGenAI } = require('@google/genai');

// @desc    Get expenses
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add expense
// @route   POST /api/expenses
// @access  Private
const addExpense = async (req, res) => {
  try {
    const { amount, category, date, description } = req.body;

    if (!amount || !category || !description) {
      res.status(400).json({ message: 'Please add all required fields' });
      return;
    }

    const expense = await Expense.create({
      amount,
      category,
      date: date || Date.now(),
      description,
      user: req.user.id,
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Make sure the logged in user matches the expense user
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Make sure the logged in user matches the expense user
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await expense.deleteOne();

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get expense insights using Gemini API
// @route   GET /api/expenses/insights
// @access  Private
const getExpenseInsights = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id });
    
    if (!expenses || expenses.length === 0) {
      return res.status(200).json({ insights: "You haven't added any expenses yet. Add some to get personalized financial insights!" });
    }

    // Format expenses for the prompt
    const totalAmount = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    
    // Group by category
    const categoryTotals = {};
    expenses.forEach(exp => {
      if (categoryTotals[exp.category]) {
        categoryTotals[exp.category] += exp.amount;
      } else {
        categoryTotals[exp.category] = exp.amount;
      }
    });

    const categoriesStr = Object.entries(categoryTotals)
      .map(([cat, amt]) => `- ${cat}: $${amt}`)
      .join('\n');

    const prompt = `I am a user of an expense tracker app. I need some short, helpful financial insights based on my spending.
My total expenses are $${totalAmount}. 
Here is the breakdown by category:
${categoriesStr}

Please provide a 2-3 paragraph brief analysis of my spending habits, any areas where I could save money, and an encouraging closing statement. Keep it concise, friendly, and helpful.`;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    res.status(200).json({ insights: response.text });
  } catch (error) {
    console.error('Error getting insights:', error);
    res.status(500).json({ message: 'Failed to get insights from AI.' });
  }
};

module.exports = {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getExpenseInsights,
};