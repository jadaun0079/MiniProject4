import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import Layout from '../components/Layout';
import BudgetModal from '../components/BudgetModal';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import StatCard from '../components/StatCard';
import { useToast } from '../components/Toast';
import { formatCurrency } from '../utils/constants';
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Percent,
  Wallet,
  ArrowUpRight,
} from 'lucide-react';

const Budgets = () => {
  const { currency, apiBase } = useContext(AuthContext);
  const { showToast } = useToast();

  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${apiBase}/budgets`);
      setBudgets(data || []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      showToast('Could not load budget data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [apiBase, showToast]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const confirmDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`${apiBase}/budgets/${deletingId}`);
      showToast('Budget guardrail removed.', 'success');
      setDeletingId(null);
      fetchBudgets();
    } catch (error) {
      showToast('Failed to delete budget.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEdit = (b) => {
    setEditingBudget(b);
    setModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingBudget(null);
    setModalOpen(true);
  };

  // Aggregated totals
  const totalAllocated = budgets.reduce((acc, curr) => acc + curr.amount, 0);
  const totalSpent = budgets.reduce((acc, curr) => acc + curr.spent, 0);
  const totalRemaining = Math.max(0, totalAllocated - totalSpent);
  const globalUtilization =
    totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  return (
    <Layout title="Budget Guardrails" onTransactionAdded={fetchBudgets}>
      {/* Header Info & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-white font-heading tracking-tight">
            Category Budget Limits
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Automated guardrails measuring current calendar month spending against target ceilings
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-violet-500/25 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Set Category Budget</span>
        </button>
      </div>

      {/* Top 4 Budget Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Budget Cap"
          value={formatCurrency(totalAllocated, currency)}
          subtitle={`${budgets.length} active category caps`}
          icon={Target}
          variant="violet"
          isLoading={loading}
        />
        <StatCard
          title="Current Month Spent"
          value={formatCurrency(totalSpent, currency)}
          subtitle="Directly debited across budgets"
          icon={Wallet}
          variant={totalSpent > totalAllocated ? 'rose' : 'cyan'}
          isLoading={loading}
        />
        <StatCard
          title="Safe Remaining Margin"
          value={formatCurrency(totalRemaining, currency)}
          subtitle="Remaining allowable allocation"
          icon={CheckCircle2}
          variant="emerald"
          isLoading={loading}
        />
        <StatCard
          title="Budget Utilization"
          value={`${globalUtilization}%`}
          subtitle={globalUtilization > 90 ? 'Alert: Nearing global cap' : 'Pacing healthy'}
          icon={Percent}
          variant={globalUtilization > 90 ? 'rose' : globalUtilization > 75 ? 'amber' : 'emerald'}
          isLoading={loading}
        />
      </div>

      {/* Budgets Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-3xl skeleton-shimmer" />
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No category budgets configured"
          description="Setting budget limits helps you prevent overspending and hit your savings goals. Configure your first monthly category ceiling."
          actionText="Create Budget Ceiling"
          onAction={handleAddNew}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((b) => {
            const isExceeded = b.status === 'exceeded';
            const isWarning = b.status === 'warning';

            return (
              <div
                key={b._id}
                className={`glass-panel p-6 rounded-3xl relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                  isExceeded
                    ? 'border-rose-500/40 shadow-rose-500/10'
                    : isWarning
                    ? 'border-amber-500/30 shadow-amber-500/10'
                    : 'hover:border-violet-500/30'
                }`}
              >
                {/* Header: Category & Status Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white font-heading">{b.category}</h3>
                    <p className="text-[11px] text-slate-400 capitalize">
                      {b.period || 'Monthly'} Guardrail
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                      isExceeded
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        : isWarning
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {isExceeded ? (
                      <>
                        <ShieldAlert className="w-3.5 h-3.5" /> Over Budget!
                      </>
                    ) : isWarning ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" /> 75%+ Utilized
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Healthy
                      </>
                    )}
                  </span>
                </div>

                {/* Numbers */}
                <div className="my-5">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-2xl font-extrabold text-white font-heading tabular-nums">
                      {formatCurrency(b.spent, currency)}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold tabular-nums">
                      of {formatCurrency(b.amount, currency)}
                    </span>
                  </div>

                  {/* Animated Progress Bar */}
                  <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isExceeded
                          ? 'bg-gradient-to-r from-rose-500 to-pink-600'
                          : isWarning
                          ? 'bg-gradient-to-r from-amber-500 to-orange-600'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      }`}
                      style={{ width: `${Math.min(b.percentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs mt-2 text-slate-400">
                    <span>{b.percentage}% consumed</span>
                    <span className="font-semibold text-slate-300 tabular-nums">
                      {b.remaining >= 0
                        ? `${formatCurrency(b.remaining, currency)} remaining`
                        : `${formatCurrency(Math.abs(b.remaining), currency)} over cap`}
                    </span>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleEdit(b)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Limit</span>
                  </button>
                  <button
                    onClick={() => setDeletingId(b._id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Budget"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Budget Modal */}
      <BudgetModal
        isOpen={modalOpen}
        initialData={editingBudget}
        onClose={() => {
          setModalOpen(false);
          setEditingBudget(null);
        }}
        onBudgetSaved={fetchBudgets}
      />

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        isLoading={deleteLoading}
        title="Delete Budget Ceiling"
        message="Are you sure you want to remove this category budget guardrail? Your past transactions in this category will not be deleted."
      />
    </Layout>
  );
};

export default Budgets;
