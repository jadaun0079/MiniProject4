import { useState } from 'react';
import axios from 'axios';
import { Plus } from 'lucide-react';

const ExpenseForm = ({ onExpenseAdded }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const categories = ['Food', 'Transport', 'Education', 'Entertainment', 'Shopping', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !category || !description) return;

    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/expenses`, 
        { amount: Number(amount), category, description, date },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

      setAmount('');
      setCategory('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      onExpenseAdded(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8">
      <h3 className="text-xl font-bold text-white mb-6">Add Expense</h3>
      <form onSubmit={handleSubmit} className="space-y-5 flex flex-col">
        
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-300 ml-1">Amount ($)</label>
          <input
            type="number" step="0.01" required
            className="w-full rounded-xl bg-slate-900/50 border border-white/10 px-4 py-3 text-white focus:border-blue-500 focus:bg-slate-900/80 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none leading-none h-[50px] m-0"
            value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
            style={{ colorScheme: 'dark' }}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-300 ml-1">Category</label>
          <select
            required
            className="w-full rounded-xl bg-slate-900/50 border border-white/10 px-4 py-3 text-white focus:border-blue-500 focus:bg-slate-900/80 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none appearance-none leading-none h-[50px] m-0"
            value={category} onChange={(e) => setCategory(e.target.value)}
            style={{ colorScheme: 'dark' }}
          >
            <option value="" disabled>Select Category</option>
            {categories.map((cat) => <option key={cat} value={cat} className="bg-slate-800">{cat}</option>)}
          </select>
        </div>
        
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-300 ml-1">Date</label>
          <input
            type="date" required
            className="w-full rounded-xl bg-slate-900/50 border border-white/10 px-4 py-3 text-white focus:border-blue-500 focus:bg-slate-900/80 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none leading-none h-[50px] m-0"
            value={date} onChange={(e) => setDate(e.target.value)}
            style={{ colorScheme: 'dark' }}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-300 ml-1">Description</label>
          <input
            type="text" required
            className="w-full rounded-xl bg-slate-900/50 border border-white/10 px-4 py-3 text-white focus:border-blue-500 focus:bg-slate-900/80 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none leading-none h-[50px] m-0"
            value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What was this for?"
          />
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full mt-2 flex justify-center items-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 h-[50px] text-sm font-bold text-white transition-all hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 disabled:opacity-50 disabled:scale-100"
        >
          {loading ? 'Saving...' : 'Save Expense'}
          {!loading && <Plus className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;
