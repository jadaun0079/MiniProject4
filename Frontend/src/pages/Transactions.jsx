import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import Layout from '../components/Layout';
import TransactionModal from '../components/TransactionModal';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import { useToast } from '../components/Toast';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
  formatCurrency,
  formatDate,
} from '../utils/constants';
import {
  Search,
  Filter,
  Download,
  Plus,
  Edit2,
  Trash2,
  ArrowUpDown,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  X,
} from 'lucide-react';

const Transactions = () => {
  const { currency, apiBase } = useContext(AuthContext);
  const { showToast } = useToast();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });

  // Filters & Search
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Sorting
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (categoryFilter !== 'All') params.append('category', categoryFilter);
      if (paymentMethodFilter !== 'All') params.append('paymentMethod', paymentMethodFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      params.append('page', currentPage);
      params.append('limit', 20);

      const { data } = await axios.get(`${apiBase}/expenses?${params.toString()}`);
      setTransactions(data.transactions || []);
      setMeta(data.meta || { page: 1, pages: 1, total: 0 });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showToast('Could not load transactions.', 'error');
    } finally {
      setLoading(false);
    }
  }, [
    apiBase,
    search,
    typeFilter,
    categoryFilter,
    paymentMethodFilter,
    startDate,
    endDate,
    sortBy,
    sortOrder,
    currentPage,
    showToast,
  ]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Handle Export CSV
  const handleExportCSV = async () => {
    setExportLoading(true);
    try {
      const response = await axios.get(`${apiBase}/expenses/export`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `FinVortex_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Transactions exported to CSV successfully.', 'success');
    } catch (error) {
      console.error('Export error:', error);
      showToast('Failed to export CSV.', 'error');
    } finally {
      setExportLoading(false);
    }
  };

  // Delete Action
  const confirmDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`${apiBase}/expenses/${deletingId}`);
      showToast('Transaction deleted successfully.', 'success');
      setDeletingId(null);
      fetchTransactions();
    } catch (error) {
      showToast('Failed to delete transaction.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEdit = (tx) => {
    setEditingTransaction(tx);
    setModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingTransaction(null);
    setModalOpen(true);
  };

  const resetFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setCategoryFilter('All');
    setPaymentMethodFilter('All');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    search ||
    typeFilter !== 'all' ||
    categoryFilter !== 'All' ||
    paymentMethodFilter !== 'All' ||
    startDate ||
    endDate;

  const allCategories = ['All', ...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

  return (
    <Layout title="Transactions & Ledger" onTransactionAdded={fetchTransactions}>
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-white font-heading tracking-tight">
            Transactions Registry
          </h2>
          <p className="text-xs text-slate-400">
            {meta.total} authoritative records stored in your ledger
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            disabled={exportLoading || transactions.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all disabled:opacity-40"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-violet-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-5 rounded-3xl mb-6 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by description, merchant, or notes..."
              className="w-full bg-[#0B1020]/90 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type Toggle Pills */}
          <div className="flex items-center p-1 rounded-2xl bg-[#0B1020] border border-white/10 text-xs font-semibold shrink-0">
            <button
              onClick={() => {
                setTypeFilter('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                typeFilter === 'all'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => {
                setTypeFilter('expense');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                typeFilter === 'expense'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => {
                setTypeFilter('income');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                typeFilter === 'income'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Income
            </button>
          </div>
        </div>

        {/* Extended Dropdowns Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Category Select */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#0B1020]/90 border border-white/10 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500 transition-all cursor-pointer"
            >
              {allCategories.map((cat) => (
                <option key={cat} value={cat} className="bg-[#121A2B]">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Select */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">
              Payment Method
            </label>
            <select
              value={paymentMethodFilter}
              onChange={(e) => {
                setPaymentMethodFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#0B1020]/90 border border-white/10 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500 transition-all cursor-pointer"
            >
              <option value="All" className="bg-[#121A2B]">
                All Methods
              </option>
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm} className="bg-[#121A2B]">
                  {pm}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#0B1020]/90 border border-white/10 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500 transition-all"
              style={{ colorScheme: 'dark' }}
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#0B1020]/90 border border-white/10 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500 transition-all"
              style={{ colorScheme: 'dark' }}
            />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
            <span className="text-slate-400">
              Active filters applied. Showing matching records.
            </span>
            <button
              onClick={resetFilters}
              className="text-violet-400 hover:text-violet-300 font-bold"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Transactions Data Table */}
      <div className="glass-panel rounded-3xl overflow-hidden p-6">
        {loading ? (
          <div className="space-y-4 py-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 rounded-2xl skeleton-shimmer w-full" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={Filter}
            title={hasActiveFilters ? 'No matching transactions' : 'No transactions recorded yet'}
            description={
              hasActiveFilters
                ? 'Try adjusting your search query, type, or date range filters.'
                : 'Your ledger is clean. Add your first financial record to get started.'
            }
            actionText={hasActiveFilters ? 'Clear Filters' : 'Add First Transaction'}
            onAction={hasActiveFilters ? resetFilters : handleAddNew}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                    <th
                      className="pb-3 pl-3 cursor-pointer hover:text-white transition-colors"
                      onClick={() => {
                        setSortBy('date');
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Date</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="pb-3">Title & Notes</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3 hidden md:table-cell">Payment Method</th>
                    <th
                      className="pb-3 text-right cursor-pointer hover:text-white transition-colors"
                      onClick={() => {
                        setSortBy('amount');
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>Amount</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="pb-3 text-right pr-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map((tx) => {
                    const isIncome = tx.type === 'income';
                    return (
                      <tr
                        key={tx._id}
                        className="group hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-4 pl-3 text-xs font-semibold text-slate-400 tabular-nums whitespace-nowrap">
                          {formatDate(tx.date)}
                        </td>
                        <td className="py-4 max-w-xs sm:max-w-md">
                          <div className="font-bold text-white group-hover:text-violet-300 transition-colors truncate">
                            {tx.description}
                          </div>
                          {tx.notes && (
                            <div className="text-xs text-slate-500 truncate mt-0.5">
                              {tx.notes}
                            </div>
                          )}
                        </td>
                        <td className="py-4">
                          <span className="inline-block px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/5 text-xs text-slate-300 font-medium whitespace-nowrap">
                            {tx.category}
                          </span>
                        </td>
                        <td className="py-4 hidden md:table-cell text-xs text-slate-400 whitespace-nowrap">
                          <span className="flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                            {tx.paymentMethod || 'Credit Card'}
                          </span>
                        </td>
                        <td className="py-4 text-right tabular-nums whitespace-nowrap">
                          <span
                            className={`font-extrabold text-sm ${
                              isIncome ? 'text-emerald-400' : 'text-slate-100'
                            }`}
                          >
                            {isIncome ? '+' : '-'}
                            {formatCurrency(tx.amount, currency)}
                          </span>
                        </td>
                        <td className="py-4 text-right pr-3 whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(tx)}
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

            {/* Pagination Controls */}
            {meta.pages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-white/5 text-xs">
                <span className="text-slate-400">
                  Showing page <span className="font-bold text-white">{meta.page}</span> of{' '}
                  <span className="font-bold text-white">{meta.pages}</span> ({meta.total} records)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:hover:bg-white/5 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage >= meta.pages}
                    onClick={() => setCurrentPage((p) => Math.min(meta.pages, p + 1))}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:hover:bg-white/5 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={modalOpen}
        initialData={editingTransaction}
        onClose={() => {
          setModalOpen(false);
          setEditingTransaction(null);
        }}
        onTransactionSaved={fetchTransactions}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        isLoading={deleteLoading}
        title="Delete Transaction"
        message="Are you sure you want to permanently delete this transaction record? It will be removed from your database and all financial totals will recalculate."
      />
    </Layout>
  );
};

export default Transactions;
