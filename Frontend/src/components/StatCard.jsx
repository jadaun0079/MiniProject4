import React from 'react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'violet',
  isLoading = false,
}) => {
  const variantStyles = {
    violet: {
      border: 'hover:border-violet-500/30',
      iconBg: 'from-violet-500 to-indigo-600',
      shadow: 'shadow-violet-500/10',
      accentGlow: 'bg-violet-500/10',
      text: 'text-violet-400',
    },
    emerald: {
      border: 'hover:border-emerald-500/30',
      iconBg: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/10',
      accentGlow: 'bg-emerald-500/10',
      text: 'text-emerald-400',
    },
    rose: {
      border: 'hover:border-rose-500/30',
      iconBg: 'from-rose-500 to-pink-600',
      shadow: 'shadow-rose-500/10',
      accentGlow: 'bg-rose-500/10',
      text: 'text-rose-400',
    },
    cyan: {
      border: 'hover:border-cyan-500/30',
      iconBg: 'from-cyan-500 to-blue-600',
      shadow: 'shadow-cyan-500/10',
      accentGlow: 'bg-cyan-500/10',
      text: 'text-cyan-400',
    },
    amber: {
      border: 'hover:border-amber-500/30',
      iconBg: 'from-amber-500 to-orange-600',
      shadow: 'shadow-amber-500/10',
      accentGlow: 'bg-amber-500/10',
      text: 'text-amber-400',
    },
  };

  const style = variantStyles[variant] || variantStyles.violet;

  if (isLoading) {
    return (
      <div className="glass-panel p-6 rounded-3xl relative overflow-hidden h-[150px] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="w-24 h-4 rounded-lg skeleton-shimmer" />
          <div className="w-10 h-10 rounded-2xl skeleton-shimmer" />
        </div>
        <div>
          <div className="w-36 h-8 rounded-xl skeleton-shimmer mb-2" />
          <div className="w-20 h-3 rounded-md skeleton-shimmer" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`glass-panel p-6 rounded-3xl relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${style.border} ${style.shadow}`}
    >
      {/* Background radial glow */}
      <div
        className={`absolute -right-8 -top-8 w-32 h-32 rounded-full ${style.accentGlow} blur-2xl pointer-events-none`}
      />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div
            className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${style.iconBg} flex items-center justify-center text-white shadow-md shadow-black/20`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="relative z-10">
        <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight tabular-nums font-heading">
          {value}
        </div>

        <div className="flex items-center gap-2 mt-2">
          {trend && (
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                trend.startsWith('+')
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {trend}
            </span>
          )}
          {subtitle && <span className="text-xs text-slate-400">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
