import { useContext } from 'react';
import { Menu, Sun, Moon, Plus, Wallet } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import { CURRENCIES } from '../utils/constants';

const Navbar = ({ onOpenSidebar, onOpenNewTransaction, title = 'Dashboard' }) => {
  const { user, theme, toggleTheme, currency } = useContext(AuthContext);

  const activeCurrency = CURRENCIES[currency] || CURRENCIES.USD;

  return (
    <header className="h-20 border-b border-white/5 bg-[#0B1020]/80 backdrop-blur-xl sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2.5 rounded-xl bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white font-heading tracking-tight">
            {title}
          </h1>
          <p className="text-xs text-slate-400 hidden sm:block">
            Real-time financial intelligence
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Currency Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-300">
          <Wallet className="w-3.5 h-3.5 text-violet-400" />
          <span>{activeCurrency.code} ({activeCurrency.symbol})</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all duration-200"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400" />
          )}
        </button>

        {/* Quick Add Transaction CTA */}
        {onOpenNewTransaction && (
          <button
            onClick={onOpenNewTransaction}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Record</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
