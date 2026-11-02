import React, { useContext } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import AuthContext from '../../context/AuthContext';
import { formatCurrency } from '../../utils/constants';

const DailyTrendLineChart = ({ expenses = [], title = 'Daily Spending Trajectory' }) => {
  const { currency } = useContext(AuthContext);

  // Group and sort expenses by date
  const expenseTransactions = expenses.filter((e) => e.type === 'expense');

  if (!expenseTransactions || expenseTransactions.length === 0) {
    return (
      <div className="glass-panel p-6 rounded-3xl h-[340px] flex flex-col">
        <h3 className="text-base font-bold text-white font-heading mb-4">{title}</h3>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <p className="text-sm font-semibold text-slate-400">No spending data available</p>
          <p className="text-xs text-slate-500 mt-1">
            Daily velocity and trajectory will graph here automatically.
          </p>
        </div>
      </div>
    );
  }

  const sorted = [...expenseTransactions].sort((a, b) => new Date(a.date) - new Date(b.date));

  const dateMap = {};
  sorted.forEach((exp) => {
    const d = new Date(exp.date);
    const label = `${d.getMonth() + 1}/${d.getDate()}`;
    dateMap[label] = (dateMap[label] || 0) + exp.amount;
  });

  const data = Object.keys(dateMap)
    .slice(-14)
    .map((date) => ({
      date,
      amount: Math.round(dateMap[date] * 100) / 100,
    }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 rounded-xl border border-white/10 shadow-2xl text-xs space-y-1">
          <p className="text-slate-400 font-medium">Date: {label}</p>
          <p className="text-white font-bold tabular-nums">
            Spent: {formatCurrency(payload[0].value, currency)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel p-6 rounded-3xl h-[340px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white font-heading">{title}</h3>
          <p className="text-xs text-slate-400">Past 14 active spending days</p>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => {
                if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                return val;
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#8B5CF6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#areaGradient)"
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DailyTrendLineChart;
