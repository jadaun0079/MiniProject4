import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MonthlyBarChart = ({ expenses }) => {
  // Aggregate by month (e.g., "Jan 2025")
  const dataMap = expenses.reduce((acc, expense) => {
    const date = new Date(expense.date);
    const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    acc[monthYear] = (acc[monthYear] || 0) + expense.amount;
    return acc;
  }, {});

  // Sort chronologically - this is a simplified sort by relying on the keys or we just take the last 6 months
  const data = Object.keys(dataMap).map(key => ({
    name: key,
    amount: dataMap[key]
  })).reverse(); // Assuming it came sorted descending

  if (data.length === 0) {
    return <div className="flex h-full items-center justify-center text-slate-400">No data available</div>;
  }

  return (
    <div className="h-64 w-full">
      <h3 className="text-center text-sm font-medium text-slate-300 mb-2">Monthly Expenses</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
          <Tooltip 
            formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']}
            cursor={{ fill: '#334155', opacity: 0.4 }}
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
          />
          <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyBarChart;
