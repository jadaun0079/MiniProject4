import React, { useContext } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import AuthContext from '../../context/AuthContext';
import { formatCurrency } from '../../utils/constants';

const CashflowBarChart = ({ monthlyTrends = [], title = 'Cash Flow Comparison (Income vs Outflow)' }) => {
  const { currency } = useContext(AuthContext);

  if (!monthlyTrends || monthlyTrends.length === 0) {
    return (
      <div className="glass-panel p-6 rounded-3xl h-[340px] flex flex-col">
        <h3 className="text-base font-bold text-white font-heading mb-4">{title}</h3>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <p className="text-sm font-semibold text-slate-400">No monthly trends recorded yet</p>
          <p className="text-xs text-slate-500 mt-1">
            As you log income and expenses, monthly comparisons will chart here.
          </p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3.5 rounded-xl border border-white/10 shadow-2xl text-xs space-y-1.5">
          <p className="font-bold text-white border-b border-white/10 pb-1">{label}</p>
          {payload.map((item) => (
            <div key={item.dataKey} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}:
              </span>
              <span className="font-bold text-white tabular-nums">
                {formatCurrency(item.value, currency)}
              </span>
            </div>
          ))}
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
          <p className="text-xs text-slate-400">Monthly breakdown over the last 6 months</p>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="label"
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
            <Legend
              wrapperStyle={{ paddingTop: 8, fontSize: 12 }}
              formatter={(value) => <span className="text-slate-300 text-xs font-semibold">{value}</span>}
            />
            <Bar
              dataKey="income"
              name="Income"
              fill="#10B981"
              radius={[6, 6, 0, 0]}
              animationDuration={800}
            />
            <Bar
              dataKey="expense"
              name="Expenses"
              fill="#F43F5E"
              radius={[6, 6, 0, 0]}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CashflowBarChart;
