import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { UserPlus, Activity } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await register(name, email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen min-h-screen items-center justify-center overflow-hidden bg-[#020617]">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px] mix-blend-screen animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] left-[-10%] h-96 w-96 rounded-full bg-pink-600/20 blur-[120px] mix-blend-screen animate-pulse-slow"></div>

      <div className="relative z-10 w-full max-w-md px-6 animate-slide-up">
        {/* Brand Header */}
        <div className="mb-10 text-center flex flex-col items-center">
          <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-pink-500 shadow-lg shadow-indigo-500/30 mb-6">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">Join ExpenseTracker</h2>
          <p className="text-slate-400 font-medium text-sm">Create an account to start managing money.</p>
        </div>

        {/* Glassmorphic Form Card */}
        <div className="glass rounded-3xl p-8 sm:p-10">
          {error && (
            <div className="mb-6 rounded-xl bg-red-500/10 p-4 border border-red-500/20 text-sm text-red-400 flex items-center gap-3 animate-fade-in">
              <div className="h-1.5 w-1.5 rounded-full bg-red-400 flex-shrink-0"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
              <input
                type="text"
                required
                className="w-full rounded-xl bg-slate-800/50 border border-slate-700/50 px-4 py-3.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-800/80 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
              <input
                type="email"
                required
                className="w-full rounded-xl bg-slate-800/50 border border-slate-700/50 px-4 py-3.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-800/80 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full rounded-xl bg-slate-800/50 border border-slate-700/50 px-4 py-3.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-800/80 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-600 px-4 py-4 text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 mt-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
              {!loading && <UserPlus className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-slate-400">Already registered? </span>
            <Link to="/login" className="font-semibold text-indigo-400 transition-colors hover:text-indigo-300">
              Sign in securely
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
