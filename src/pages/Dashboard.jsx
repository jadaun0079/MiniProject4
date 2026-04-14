import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import ExpenseFilter from '../components/ExpenseFilter';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import MonthlyBarChart from '../components/charts/MonthlyBarChart';
import WeeklyLineChart from '../components/charts/WeeklyLineChart';
import { LogOut, Activity, Sparkles } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [showInsightsModal, setShowInsightsModal] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/expenses`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    setInsightsLoading(true);
    setShowInsightsModal(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/expenses/insights`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      setInsights(data.insights);
    } catch (error) {
      console.error('Error fetching insights:', error);
      setInsights('Failed to generate insights. Please try again later.');
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleExpenseAdded = (newExpense) => {
    setExpenses([newExpense, ...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)));
  };

  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter((e) => e._id !== id));
  };

  const filteredExpenses = expenses.filter(expense => {
    let matchCategory = filterCategory === 'All' ? true : expense.category === filterCategory;
    let matchDate = true;
    if (dateRange.start) matchDate = matchDate && new Date(expense.date) >= new Date(dateRange.start);
    if (dateRange.end) {
      const end = new Date(dateRange.end);
      end.setDate(end.getDate() + 1);
      matchDate = matchDate && new Date(expense.date) < end;
    }
    return matchCategory && matchDate;
  });

  const totalExpenses = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="min-h-screen bg-[#020617] pb-12 overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen pointer-events-none"></div>
      <div className="absolute top-[40%] right-[-10%] h-[600px] w-[600px] rounded-full bg-purple-600/10 blur-[120px] mix-blend-screen pointer-events-none"></div>

      {/* Navigation */}
      <nav className="glass border-b border-white/5 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-xl p-2 shadow-lg shadow-blue-500/20">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Expense<span className="text-blue-400">Tracker</span></span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-slate-300 text-sm hidden sm:block">Welcome back, <span className="font-semibold text-white">{user?.name}</span></span>
            <button 
              onClick={logout}
              className="flex items-center gap-2 text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-white transition-all duration-300"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8 relative z-10 animate-fade-in">
        {/* Header Metric */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 sm:p-10 shadow-2xl shadow-blue-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="absolute top-0 right-0 p-12 opacity-10 blur-xl mix-blend-overlay pointer-events-none">
             <div className="h-32 w-32 rounded-full bg-white"></div>
          </div>
          <div className="relative z-10 mb-6 sm:mb-0">
            <h2 className="text-blue-100 font-medium mb-2 text-lg">Total Filtered Expenses</h2>
            <div className="text-5xl font-extrabold text-white tracking-tight">${totalExpenses.toFixed(2)}</div>
          </div>
          <button 
            onClick={fetchInsights}
            className="relative z-10 flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl border border-white/20 font-medium transition-all shadow-lg backdrop-blur-md"
          >
            <Sparkles className="h-5 w-5 text-yellow-300" />
            Get AI Insights
          </button>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-3xl p-6">
            <CategoryPieChart expenses={filteredExpenses} />
          </div>
          <div className="glass-card rounded-3xl p-6">
            <MonthlyBarChart expenses={filteredExpenses} />
          </div>
          <div className="glass-card rounded-3xl p-6">
            <WeeklyLineChart expenses={filteredExpenses} />
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-1 space-y-6">
            <ExpenseForm onExpenseAdded={handleExpenseAdded} />
            <ExpenseFilter 
              filterCategory={filterCategory} 
              setFilterCategory={setFilterCategory}
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
          </div>
          
          <div className="xl:col-span-2 glass-card rounded-3xl p-6 sm:p-8">
            <h3 className="text-xl font-bold text-white mb-6">Recent Transactions</h3>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : (
              <ExpenseList expenses={filteredExpenses} onDeleteExpense={handleDeleteExpense} />
            )}
          </div>
        </div>

        {/* AI Insights Modal */}
        {showInsightsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative">
              <button 
                onClick={() => setShowInsightsModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                ✕
              </button>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-500/20 p-2 rounded-lg">
                  <Sparkles className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">AI Financial Insights</h3>
              </div>
              
              <div className="text-slate-300 min-h-[150px] max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {insightsLoading ? (
                  <div className="flex flex-col items-center justify-center h-full py-12 gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
                    <p className="animate-pulse text-purple-300">Analyzing your expenses with Gemini AI...</p>
                  </div>
                ) : (
                  <div className="space-y-4 whitespace-pre-wrap leading-relaxed">
                    {insights}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
