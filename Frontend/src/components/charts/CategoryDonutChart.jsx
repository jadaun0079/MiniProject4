import React, { useContext } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import AuthContext from '../../context/AuthContext';
import { formatCurrency, CATEGORY_COLORS } from '../../utils/constants';

const DEFAULT_PALETTE = [
  '#8B5CF6',
  '#22D3EE',
  '#10B981',
  '#F59E0B',
  '#EC4899',
  '#3B82F6',
  '#F43F5E',
  '#A855F7',
  '#14B8A6',
];

const CategoryDonutChart = ({ categoryData = [], title = 'Expenditure by Category' }) => {
  const { currency } = useContext(AuthContext);

  if (!categoryData || categoryData.length === 0) {
    return (
      <div className="glass-panel p-6 rounded-3xl h-[340px] flex flex-col">
        <h3 className="text-base font-bold text-white font-heading mb-4">{title}</h3>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <p className="text-sm font-semibold text-slate-400">No expense categories yet</p>
          <p className="text-xs text-slate-500 mt-1">
            Recorded expense categories will visualize here automatically.
          </p>
        </div>
      </div>
    );
  }

  const total = categoryData.reduce((acc, curr) => acc + (curr.value || 0), 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="glass-panel p-3 rounded-xl border border-white/10 shadow-2xl text-xs space-y-1">
          <p className="font-bold text-white flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: payload[0].color }}
            />
            {item.name}
          </p>
          <p className="text-slate-300 font-semibold tabular-nums">
            {formatCurrency(item.value, currency)}
          </p>
          <p className="text-slate-400 text-[11px] font-medium">
            {item.percentage ? `${item.percentage}% of total` : `${((item.value / total) * 100).toFixed(1)}%`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel p-6 rounded-3xl h-[340px] flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-bold text-white font-heading">{title}</h3>
        <span className="text-xs font-semibold text-slate-400 tabular-nums">
          Total: {formatCurrency(total, currency)}
        </span>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row items-center gap-4">
        {/* Donut Chart */}
        <div className="w-full sm:w-1/2 h-52 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                animationDuration={900}
              >
                {categoryData.map((entry, index) => {
                  const color =
                    CATEGORY_COLORS[entry.name] ||
                    DEFAULT_PALETTE[index % DEFAULT_PALETTE.length];
                  return <Cell key={`cell-${index}`} fill={color} stroke="transparent" />;
                })}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend List */}
        <div className="w-full sm:w-1/2 max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar text-xs">
          {categoryData.map((item, index) => {
            const color =
              CATEGORY_COLORS[item.name] ||
              DEFAULT_PALETTE[index % DEFAULT_PALETTE.length];
            return (
              <div
                key={item.name}
                className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-slate-300 font-medium truncate">{item.name}</span>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className="text-white font-bold tabular-nums">
                    {formatCurrency(item.value, currency)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryDonutChart;
