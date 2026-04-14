import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const WeeklyLineChart = ({ expenses }) => {
  // Sort expenses ascending
  const sorted = [...expenses].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Group by exact date for simplicity
  const dataMap = sorted.reduce((acc, expense) => {
    const dateStr = new Date(expense.date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });
    acc[dateStr] = (acc[dateStr] || 0) + expense.amount;
    return acc;
  }, {});

  // Take last 14 unique days
  const data = Object.keys(dataMap).slice(-14).map(key => ({
    date: key,
    amount: dataMap[key]
  }));

  if (data.length === 0) {
    return <div className="flex h-full items-center justify-center text-slate-400">No data available</div>;
  }

  return (
    <div className="h-64 w-full">
      <h3 className="text-center text-sm font-medium text-slate-300 mb-2">Daily Spending Trend</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
          <Tooltip 
            formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']}
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
          />
          <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyLineChart;
