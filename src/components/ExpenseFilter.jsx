import { Filter } from 'lucide-react';

const ExpenseFilter = ({ filterCategory, setFilterCategory, dateRange, setDateRange }) => {
  const categories = ['All', 'Food', 'Transport', 'Education', 'Entertainment', 'Shopping', 'Other'];

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col gap-4">
      <div className="flex items-center gap-2 text-white font-bold text-lg mb-2">
        <Filter className="h-5 w-5 text-blue-400" />
        Advanced Filters
      </div>

      <div className="space-y-1.5 w-full">
        <label className="text-xs font-medium text-slate-400 ml-1">Category</label>
        <select
          className="w-full rounded-xl bg-slate-900/50 border border-white/10 px-4 py-2.5 text-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none appearance-none h-[44px] leading-none m-0"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{ colorScheme: 'dark' }}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat} className="bg-slate-800">{cat}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400 ml-1">From</label>
          <input
            type="date"
            className="w-full rounded-xl bg-slate-900/50 border border-white/10 px-3 py-2.5 text-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none h-[44px] leading-none m-0"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            style={{ colorScheme: 'dark' }}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400 ml-1">To</label>
          <input
            type="date"
            className="w-full rounded-xl bg-slate-900/50 border border-white/10 px-3 py-2.5 text-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none h-[44px] leading-none m-0"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            style={{ colorScheme: 'dark' }}
          />
        </div>
      </div>
    </div>
  );
};

export default ExpenseFilter;
