import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, Zap } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#0B1020] text-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/15 blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-600/15 blur-[140px] pointer-events-none" />

      <div className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl text-center space-y-6 relative z-10 animate-fade-in shadow-2xl">
        <div className="w-16 h-16 rounded-3xl bg-violet-500/10 border border-violet-500/20 text-violet-400 mx-auto flex items-center justify-center shadow-xl shadow-violet-500/10">
          <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '20s' }} />
        </div>

        <div>
          <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 font-heading">
            404
          </span>
          <h2 className="text-xl font-bold text-white font-heading mt-2">
            Ledger Coordinate Not Found
          </h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            The requested financial telemetry route does not exist or may have been archived.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-violet-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Command Center</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
