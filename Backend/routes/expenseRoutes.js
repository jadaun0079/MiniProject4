const express = require('express');
const router = express.Router();
const {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getFinancialSummary,
  getAnalytics,
  exportExpensesCSV,
  getExpenseInsights,
} = require('../controllers/expenseControllers');
const { protect } = require('../middleware/authMiddleware');

router.get('/insights', protect, getExpenseInsights);
router.get('/summary', protect, getFinancialSummary);
router.get('/analytics', protect, getAnalytics);
router.get('/export', protect, exportExpensesCSV);

router.route('/')
  .get(protect, getExpenses)
  .post(protect, addExpense);

router.route('/:id')
  .put(protect, updateExpense)
  .delete(protect, deleteExpense);

module.exports = router;
