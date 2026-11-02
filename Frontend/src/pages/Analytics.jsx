import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import Layout from '../components/Layout';
import CashflowBarChart from '../components/charts/CashflowBarChart';
import CategoryDonutChart from '../components/charts/CategoryDonutChart';
import DailyTrendLineChart from '../components/charts/DailyTrendLineChart';
import StatCard from '../components/StatCard';
import { useToast } from '../components/Toast';
import { formatCurrency, CATEGORY_COLORS } from '../utils/constants';
import {
  TrendingUp,
  TrendingDown,
  Percent,
  PieChart,
  BarChart3,
  Calendar,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

const Analytics = () => {
  const { currency, apiBase } = useContext(AuthContext);
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    categoryBreakdown: [],
    monthlyTrends: [],
    paymentMethodBreakdown: [],
  });
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    savingsRate: 0,
    transactionCount: 0,
    topCategory: null,
  });
  const [expenses, setExpenses] = useState([]);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      const [analRes, sumRes, expRes] = await Promise.all([
        axios.get(`${apiBase}/expenses/analytics`),
        axios.get(`${apiBase}/expenses/summary`),
        axios.get(`${apiBase}/expenses?limit=100`),
      ]);

      setAnalytics(analRes.data || {});
      setSummary(sumRes.data || {});
      setExpenses(expRes.data.transactions || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      showToast('Could not load analytics reports.', 'error');
    } finally {
      setLoading(false);
    }
  }, [apiBase, showToast]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Compute key ratios
  const averageTransaction =
    summary.transactionCount > 0
      ? (summary.totalExpenses / summary.transactionCount).toFixed(2)
      : '0.00';

  const totalExpenseSum = analytics.categoryBreakdown?.reduce(
    (acc, curr) => acc + curr.value,
    0
  ) || summary.totalExpenses;

  return (
    <Layout title="Analytics & Financial Reports" onTransactionAdded={fetchAnalyticsData}>
      {/* Header Info */}
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-white font-heading tracking-tight">
          Financial Intelligence & Cash Flow Metrics
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Authoritative calculations aggregated across your ledger history
        </p>
      </div>

      {/* Ratios & Key Highlights Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Overall Savings Margin"
          value={`${summary.savingsRate}%`}
          subtitle="Proportion of revenue retained"
          icon={Percent}
          variant={summary.savingsRate >= 20 ? 'emerald' : 'amber'}
          isLoading={loading}
        />
        <StatCard
          title="Total Capital Deployed"
          value={formatCurrency(summary.totalExpenses, currency)}
          subtitle="Cumulative lifetime expenses"
          icon={TrendingDown}
          variant="rose"
          isLoading={loading}
        />
        <StatCard
          title="Average Ticket Size"
          value={formatCurrency(averageTransaction, currency)}
          subtitle="Mean outflow per transaction"
          icon={Layers}
          variant="violet"
          isLoading={loading}
        />
        <StatCard
          title="Primary Cost Driver"
          value={summary.topCategory ? summary.topCategory.name : 'None'}
          subtitle={
            summary.topCategory
              ? formatCurrency(summary.topCategory.amount, currency)
              : 'Zero expenditure'
          }
          icon={TrendingUp}
          variant="cyan"
          isLoading={loading}
        />
      </div>

      {/* Row 1: Cashflow Monthly Comparison & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <CashflowBarChart monthlyTrends={analytics.monthlyTrends} />
        <CategoryDonutChart categoryData={analytics.categoryBreakdown} />
      </div>

      {/* Row 2: Daily Spending Trajectory & Payment Method Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <DailyTrendLineChart expenses={expenses} />
        </div>

        {/* Payment Channel Allocation */}
        <div className="glass-panel p-6 rounded-3xl h-[340px] flex flex-col">
          <h3 className="text-base font-bold text-white font-heading mb-1">
            Payment Channels
          </h3>
          <p className="text-xs text-slate-400 mb-4">Volume grouped by payment method</p>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {!analytics.paymentMethodBreakdown ||
            analytics.paymentMethodBreakdown.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-xs text-slate-400">
                No payment channel data recorded yet.
              </div>
            ) : (
              analytics.paymentMethodBreakdown.map((pm) => (
                <div
                  key={pm.name}
                  className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{pm.name}</span>
                    <span className="font-extrabold text-slate-200 tabular-nums">
                      {formatCurrency(pm.total, currency)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 rounded-full"
                      style={{
                        width: `${
                          totalExpenseSum > 0
                            ? Math.min(100, (pm.total / totalExpenseSum) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {pm.count} recorded transactions
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Category Leaderboard Table */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white font-heading">
              Expenditure Breakdown Ranked
            </h3>
            <p className="text-xs text-slate-400">
              Highest to lowest spending category allocations
            </p>
          </div>
        </div>

        {!analytics.categoryBreakdown || analytics.categoryBreakdown.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            No expenses recorded yet. As you add transactions, your category ranking leaderboard will compute here.
          </div>
        ) : (
          <div className="space-y-4">
            {analytics.categoryBreakdown.map((cat, idx) => (
              <div
                key={cat.name}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-slate-400">
                      #{idx + 1}
                    </span>
                    <span className="text-sm font-bold text-white">{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-white tabular-nums">
                      {formatCurrency(cat.value, currency)}
                    </span>
                    <span className="text-xs text-slate-400 ml-2 font-semibold">
                      ({cat.percentage}%)
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(cat.percentage, 100)}%`,
                      backgroundColor: CATEGORY_COLORS[cat.name] || '#8B5CF6',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Analytics;
