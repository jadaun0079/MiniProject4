import { useState, useEffect, useContext } from 'react';
import { X, Target, Check } from 'lucide-react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useToast } from './Toast';
import { EXPENSE_CATEGORIES, CURRENCIES } from '../utils/constants';

const BudgetModal = ({ isOpen, onClose, onBudgetSaved, initialData = null }) => {
  const { currency, apiBase } = useContext(AuthContext);
  const { showToast } = useToast();

  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currencySymbol = CURRENCIES[currency]?.symbol || '$';

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category || EXPENSE_CATEGORIES[0]);
      setAmount(initialData.amount ? String(initialData.amount) : '');
    } else {
      setCategory(EXPENSE_CATEGORIES[0]);
      setAmount('');
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('Please provide a positive budget limit amount.');
      return;
    }

    setLoading(true);
    try {
      let res;
      if (initialData && initialData._id) {
        res = await axios.put(`${apiBase}/budgets/${initialData._id}`, {
          category,
          amount: numAmount,
        });
        showToast(`Budget for ${category} updated!`, 'success');
      } else {
        res = await axios.post(`${apiBase}/budgets`, {
          category,
          amount: numAmount,
          period: 'monthly',
        });
        showToast(`Monthly budget for ${category} created!`, 'success');
      }

      onBudgetSaved(res.data);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save budget.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-[#121A2B] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-heading">
                {initialData ? 'Edit Budget' : 'Set Category Budget'}
              </h3>
              <p className="text-xs text-slate-400">Monthly expenditure limit ceiling</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Category *
            </label>
            <select
              disabled={!!initialData}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#0B1020]/80 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all cursor-pointer disabled:opacity-60"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#121A2B] text-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Monthly Budget Limit ({currency}) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-lg">
                {currencySymbol}
              </span>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="500.00"
                className="w-full bg-[#0B1020]/80 border border-white/10 rounded-2xl pl-10 pr-4 py-3.5 text-xl font-extrabold text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 tabular-nums transition-all"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Spending resets at the beginning of each calendar month.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-3 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-violet-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>{initialData ? 'Update Limit' : 'Save Budget'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetModal;
