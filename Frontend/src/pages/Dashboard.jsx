import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import CashflowBarChart from '../components/charts/CashflowBarChart';
import CategoryDonutChart from '../components/charts/CategoryDonutChart';
import TransactionModal from '../components/TransactionModal';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import { useToast } from '../components/Toast';
import { formatCurrency, formatDate } from '../utils/constants';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Percent,
  Sparkles,
  ArrowRight,
  Target,
  Edit2,
  Trash2,
  PlusCircle,
  RefreshCw,
  X,
  CreditCard,
} from 'lucide-react';

const Dashboard = () => {
  const { user, currency, apiBase } = useContext(AuthContext);
  const { showToast } = useToast();

  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    savingsRate: 0,
    transactionCount: 0,
    topCategory: null,
  });

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [analytics, setAnalytics] = useState({
    categoryBreakdown: [],
    monthlyTrends: [],
  });
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Time filter state: 'all' | 'month' | '30days'
  const [filterPeriod, setFilterPeriod] = useState('all');

  // AI Insights Modal State
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // Edit / Delete State
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      let dateQuery = '';
      const now = new Date();
      if (filterPeriod === 'month') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        dateQuery = `?startDate=${start}`;
      } else if (filterPeriod === '30days') {
        const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        dateQuery = `?startDate=${start}`;
      }

      // Fetch summary, recent transactions, analytics, and budgets concurrently
      const [sumRes, txRes, analRes, budRes] = await Promise.all([
        axios.get(`${apiBase}/expenses/summary${dateQuery}`),
        axios.get(`${apiBase}/expenses?limit=6`),
        axios.get(`${apiBase}/expenses/analytics`),
        axios.get(`${apiBase}/budgets`),
      ]);

      setSummary(sumRes.data);
      setRecentTransactions(txRes.data.transactions || []);
      setAnalytics(analRes.data || { categoryBreakdown: [], monthlyTrends: [] });
      setBudgets(budRes.data || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showToast('Could not refresh dashboard records.', 'error');
    } finally {
      setLoading(false);
    }
  }, [apiBase, filterPeriod, showToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Trigger Gemini AI Insights
  const fetchInsights = async () => {
    setShowInsightsModal(true);
    setInsightsLoading(true);
    try {
      const { data } = await axios.get(`${apiBase}/expenses/insights`);
      setInsights(data.insights);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      setInsights('Failed to generate insights. Please check connection and try again.');
    } finally {
      setInsightsLoading(false);
    }
  };

  // Handle Delete Transaction
  const confirmDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`${apiBase}/expenses/${deletingId}`);
      showToast('Transaction deleted successfully.', 'success');
      setDeletingId(null);
      fetchDashboardData();
    } catch (error) {
      showToast('Failed to delete transaction.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Layout title="Financial Command Center" onTransactionAdded={fetchDashboardData}>
      {/* Top Banner / Hero Metric Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-900/40 via-[#121A2B] to-cyan-950/40 border border-white/10 p-6 sm:p-8 mb-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-300 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Account Telemetry
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
              Welcome, {user?.name || 'Investor'}
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Real-time balance computation, category budget progress, and predictive cashflow analytics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Pills */}
            <div className="flex items-center p-1 rounded-2xl bg-[#0B1020]/80 border border-white/10 text-xs font-semibold">
              <button
                onClick={() => setFilterPeriod('all')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  filterPeriod === 'all'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setFilterPeriod('month')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  filterPeriod === 'month'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setFilterPeriod('30days')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  filterPeriod === '30days'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Last 30 Days
              </button>
            </div>

            {/* AI Insights Button */}
            <button
              onClick={fetchInsights}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600/30 to-cyan-500/20 hover:from-violet-600/50 hover:to-cyan-500/30 border border-violet-500/30 text-white text-xs font-bold transition-all shadow-lg hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>AI Insights</span>
            </button>

            {/* Refresh */}
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Top Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Net Balance"
          value={formatCurrency(summary.netBalance, currency)}
          subtitle={summary.netBalance >= 0 ? 'Positive cash flow' : 'Deficit alert'}
          icon={Wallet}
          variant={summary.netBalance >= 0 ? 'emerald' : 'rose'}
          isLoading={loading}
        />
        <StatCard
          title="Total Inflows"
          value={formatCurrency(summary.totalIncome, currency)}
          subtitle={`${summary.transactionCount} total records`}
          icon={TrendingUp}
          variant="cyan"
          isLoading={loading}
        />
        <StatCard
          title="Total Outflows"
          value={formatCurrency(summary.totalExpenses, currency)}
          subtitle={summary.topCategory ? `Top: ${summary.topCategory.name}` : 'Zero expenses'}
          icon={TrendingDown}
          variant="rose"
          isLoading={loading}
        />
        <StatCard
          title="Savings Rate"
          value={`${summary.savingsRate}%`}
          subtitle={summary.savingsRate >= 20 ? 'Target achieved (≥20%)' : 'Opportunity to optimize'}
          icon={Percent}
          variant="violet"
          isLoading={loading}
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <CashflowBarChart monthlyTrends={analytics.monthlyTrends} />
        <CategoryDonutChart categoryData={analytics.categoryBreakdown} />
      </div>

      {/* Active Budgets Preview Banner (If configured) */}
      {budgets.length > 0 && (
        <div className="glass-panel p-6 rounded-3xl mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-heading">
                  Monthly Budget Guardrails
                </h3>
                <p className="text-xs text-slate-400">Live category spending versus allocated limits</p>
              </div>
            </div>
            <NavLink
              to="/budgets"
              className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1"
            >
              Manage all <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {budgets.slice(0, 3).map((b) => (
              <div key={b._id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{b.category}</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                      b.status === 'exceeded'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : b.status === 'warning'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {b.percentage}%
                  </span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      b.status === 'exceeded'
                        ? 'bg-rose-500'
                        : b.status === 'warning'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(b.percentage, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 tabular-nums">
                  <span>Spent: {formatCurrency(b.spent, currency)}</span>
                  <span>Limit: {formatCurrency(b.amount, currency)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white font-heading">Recent Transactions</h3>
            <p className="text-xs text-slate-400">Directly recorded in MongoDB database</p>
          </div>
          <NavLink
            to="/transactions"
            className="flex items-center gap-1.5 text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors"
          >
            <span>View All Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>

        {recentTransactions.length === 0 ? (
          <EmptyState
            icon={PlusCircle}
            title="No transactions recorded yet"
            description="Your account is completely ready. Add your first income or expense to see real numbers."
            actionText="Record First Transaction"
            onAction={() => setEditingTransaction({})}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                  <th className="pb-3 pl-2">Date</th>
                  <th className="pb-3">Title & Category</th>
                  <th className="pb-3 hidden sm:table-cell">Payment Method</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  return (
                    <tr
                      key={tx._id}
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-4 pl-2 text-xs font-semibold text-slate-400 tabular-nums">
                        {formatDate(tx.date)}
                      </td>
                      <td className="py-4">
                        <div className="font-bold text-white group-hover:text-violet-300 transition-colors">
                          {tx.description}
                        </div>
                        <span className="inline-block px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] text-slate-400 mt-1">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-4 hidden sm:table-cell text-xs text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                          {tx.paymentMethod || 'Credit Card'}
                        </span>
                      </td>
                      <td className="py-4 text-right tabular-nums">
                        <span
                          className={`font-extrabold text-sm ${
                            isIncome ? 'text-emerald-400' : 'text-slate-100'
                          }`}
                        >
                          {isIncome ? '+' : '-'}
                          {formatCurrency(tx.amount, currency)}
                        </span>
                      </td>
                      <td className="py-4 text-right pr-2">
                        <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingTransaction(tx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                            title="Edit Record"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingId(tx._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* AI Insights Modal */}
      {showInsightsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="bg-[#121A2B] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative">
            <button
              onClick={() => setShowInsightsModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/25">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-heading">
                  AI Financial Intelligence
                </h3>
                <p className="text-xs text-slate-400">
                  Algorithmic evaluation of your current cashflow & cost centers
                </p>
              </div>
            </div>

            <div className="text-slate-300 min-h-[160px] max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar text-sm leading-relaxed">
              {insightsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                  <div className="w-10 h-10 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-violet-300 font-semibold animate-pulse">
                    Synthesizing financial telemetry & computing recommendations...
                  </p>
                </div>
              ) : (
                <div className="space-y-4 whitespace-pre-wrap">
                  {insights}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      <TransactionModal
        isOpen={!!editingTransaction}
        initialData={editingTransaction?._id ? editingTransaction : null}
        onClose={() => setEditingTransaction(null)}
        onTransactionSaved={fetchDashboardData}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        isLoading={deleteLoading}
        title="Delete Transaction"
        message="Are you sure you want to permanently delete this financial record? Your balance and analytics will automatically update."
      />
    </Layout>
  );
};

export default Dashboard;