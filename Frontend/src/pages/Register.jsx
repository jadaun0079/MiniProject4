import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { UserPlus, Zap, Eye, EyeOff, Check, Shield, ArrowRight, Sparkles } from 'lucide-react';
import { CURRENCIES } from '../utils/constants';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useContext(AuthContext);
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Password strength calculator
  const calculateStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthScore = calculateStrength(password);
  const strengthLabels = ['Too Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const strengthColors = ['bg-rose-500', 'bg-rose-500', 'bg-amber-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-400'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);
    const result = await register(name, email, password, currency);
    if (result.success) {
      showToast('Account initialized! Welcome to FinVortex.', 'success');
      navigate('/dashboard');
    } else {
      setError(result.message);
      showToast(result.message, 'error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0B1020] text-slate-100 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed top-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/15 blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-600/15 blur-[150px] pointer-events-none" />

      {/* Left Panel: Hero Showcase */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative border-r border-white/5 bg-gradient-to-br from-[#121A2B]/80 via-[#0B1020]/90 to-[#0B1020]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-2xl font-extrabold tracking-tight text-white font-heading">
              Fin<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">Vortex</span>
            </span>
            <span className="block text-[11px] uppercase font-bold tracking-wider text-slate-500">
              Personal Wealth Command
            </span>
          </div>
        </div>

        <div className="space-y-6 my-auto max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            Instant Onboarding & Zero Setup Friction
          </div>

          <h2 className="text-4xl font-extrabold text-white font-heading leading-tight tracking-tight">
            Elevate your financial clarity in less than two minutes.
          </h2>

          <p className="text-slate-400 text-sm leading-relaxed">
            Create an isolated, cryptographically secure account. Choose your base currency, track real cashflows, enforce category budgets, and let intelligent algorithms optimize your savings rate.
          </p>

          <div className="space-y-3 pt-2">
            {[
              'Completely clean account setup with real data only',
              'Multi-currency global support (USD, EUR, GBP, INR, and more)',
              'Automated category spending analytics & CSV exports',
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-xs text-slate-300">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-500 flex items-center justify-between">
          <span>Enterprise-Grade Architecture</span>
          <span>Zero Telemetry Leaks</span>
        </div>
      </div>

      {/* Right Panel: Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md space-y-6 animate-fade-in">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-white font-heading">
              Fin<span className="text-violet-400">Vortex</span>
            </span>
          </div>

          <div className="space-y-1 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-white font-heading tracking-tight">
              Create Your Account
            </h2>
            <p className="text-sm text-slate-400">
              Initialize your personal financial intelligence hub
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl shadow-2xl relative">
            {error && (
              <div className="mb-5 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-fade-in">
                <div className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 ml-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full bg-[#0B1020]/90 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 ml-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@fintech.dev"
                  className="w-full bg-[#0B1020]/90 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 ml-1">
                  Base Currency *
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-[#0B1020]/90 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all cursor-pointer"
                >
                  {Object.values(CURRENCIES).map((c) => (
                    <option key={c.code} value={c.code} className="bg-[#121A2B] text-white">
                      {c.name} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 ml-1">
                  Password (min. 6 characters) *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#0B1020]/90 border border-white/10 rounded-2xl px-4 py-3 pr-12 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <div className="mt-2 space-y-1.5 animate-fade-in">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Strength:</span>
                      <span className="font-bold text-slate-200">
                        {strengthLabels[strengthScore]}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-full flex-1 transition-all duration-300 rounded-full ${
                            i < strengthScore
                              ? strengthColors[strengthScore]
                              : 'bg-transparent'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-violet-600/25 hover:shadow-violet-600/40 hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 mt-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/5 text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-violet-400 hover:text-violet-300 transition-colors inline-flex items-center gap-1"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;