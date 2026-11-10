import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Smartphone,
  Download,
  CheckCircle2,
  ArrowLeft,
  Zap,
  Shield,
  TrendingUp,
  Wallet,
  PieChart,
  Target,
  Star,
  Package,
  Info,
  AlertTriangle,
} from 'lucide-react';

// ── Configurable app metadata ──────────────────────────────────────────────
const APP_VERSION = '1.0.0';
const APK_PATH = '/Expense-Tracker.apk';
const APK_FILENAME = 'Expense-Tracker.apk';

const APP_DETAILS = [
  { label: 'App Name',   value: 'Expense Tracker' },
  { label: 'Platform',   value: 'Android' },
  { label: 'Package ID', value: 'com.jatin.expensetracker' },
  { label: 'File Format',value: 'APK' },
  { label: 'Version',    value: APP_VERSION },
];

const FEATURES = [
  { icon: TrendingUp, label: 'Real-time Analytics',  color: 'text-cyan-400',   bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20' },
  { icon: Wallet,     label: 'Smart Budgeting',      color: 'text-violet-400', bg: 'bg-violet-500/10',  border: 'border-violet-500/20' },
  { icon: PieChart,   label: 'Visual Reports',       color: 'text-indigo-400', bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20' },
  { icon: Target,     label: 'Budget Guardrails',    color: 'text-emerald-400',bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { icon: Shield,     label: 'JWT Secured',          color: 'text-rose-400',   bg: 'bg-rose-500/10',    border: 'border-rose-500/20' },
  { icon: Star,       label: 'AI Insights',          color: 'text-amber-400',  bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
];

// ── Main Component ──────────────────────────────────────────────────────────
const DownloadApp = () => {
  const [apkAvailable, setApkAvailable] = useState(null); // null = checking
  const [downloading, setDownloading] = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  // Check if APK is reachable via a HEAD request
  useEffect(() => {
    const controller = new AbortController();
    fetch(APK_PATH, { method: 'HEAD', signal: controller.signal })
      .then((res) => setApkAvailable(res.ok))
      .catch(() => setApkAvailable(false));
    return () => controller.abort();
  }, []);

  const handleDownload = async () => {
    if (!apkAvailable) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      const res = await fetch(APK_PATH);
      if (!res.ok) throw new Error('File not found');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = APK_FILENAME;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setDownloadDone(true);
      setTimeout(() => setDownloadDone(false), 4000);
    } catch {
      setDownloadError('Download failed. Please try again or contact support.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1020] text-slate-100 relative overflow-x-hidden">
      {/* ── Ambient blobs ── */}
      <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[160px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-15%] right-[-10%] w-[700px] h-[700px] rounded-full bg-cyan-600/10 blur-[180px] pointer-events-none -z-10" />
      <div className="fixed top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-indigo-600/8 blur-[120px] pointer-events-none -z-10" />

      {/* ── Top bar ── */}
      <header className="sticky top-0 z-30 h-16 border-b border-white/5 bg-[#0B1020]/80 backdrop-blur-xl flex items-center px-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-white">
            Fin<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">Vortex</span>
          </span>
        </div>
        <Link
          to="/dashboard"
          className="ml-auto flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* ── Hero Section ── */}
        <section className="text-center mb-20 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold uppercase tracking-widest mb-6">
            <Smartphone className="w-3.5 h-3.5" />
            Android App — Free Download
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight font-heading mb-6">
            Take Your Expenses{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400">
              Everywhere
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Manage your money anytime, anywhere with our Expense Tracker Android App.
            <br className="hidden sm:block" />
            Full-featured, offline-ready, and completely free.
          </p>
        </section>

        {/* ── Main Card (Mockup + Download) ── */}
        <section className="grid lg:grid-cols-2 gap-10 mb-20 items-center">
          {/* Phone Mockup */}
          <div className="flex justify-center animate-fade-in">
            <div className="relative">
              {/* Glow */}
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-violet-500/30 to-cyan-500/20 blur-2xl scale-110 -z-10" />

              {/* Phone shell */}
              <div className="w-64 sm:w-72 bg-[#131B30] border border-white/10 rounded-[2.5rem] p-2 shadow-2xl shadow-violet-900/30">
                {/* Notch */}
                <div className="h-6 w-20 bg-[#0B1020] rounded-full mx-auto mb-2 flex items-center justify-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-slate-700" />
                  <div className="w-6 h-1 rounded-full bg-slate-700" />
                </div>

                {/* Screen */}
                <div className="bg-[#0B1020] rounded-[2rem] p-4 space-y-3 min-h-[380px]">
                  {/* App brand */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-xs font-bold text-white">FinVortex</span>
                  </div>

                  {/* Stat cards */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Balance',  value: '₹24,560', color: 'text-cyan-400' },
                      { label: 'Spent',    value: '₹8,230',  color: 'text-rose-400' },
                      { label: 'Savings',  value: '₹5,100',  color: 'text-emerald-400' },
                      { label: 'Budgets',  value: '4 Active', color: 'text-violet-400' },
                    ].map((s) => (
                      <div key={s.label} className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                        <p className="text-[9px] text-slate-500 uppercase tracking-wider">{s.label}</p>
                        <p className={`text-xs font-bold mt-0.5 ${s.color}`}>{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Mini bar chart */}
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-2">Cash Flow</p>
                    <div className="flex items-end gap-1 h-16">
                      {[40, 65, 50, 80, 55, 70, 45, 90, 60, 75, 50, 85].map((h, i) => (
                        <div
                          key={i}
                          style={{ height: `${h}%` }}
                          className={`flex-1 rounded-sm ${i % 2 === 0 ? 'bg-violet-500/60' : 'bg-cyan-500/60'}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Recent txn */}
                  <div className="space-y-1.5">
                    {[
                      { name: 'Groceries', amt: '-₹450', type: 'expense' },
                      { name: 'Salary',    amt: '+₹32k', type: 'income' },
                    ].map((t) => (
                      <div key={t.name} className="flex items-center justify-between bg-white/[0.03] rounded-lg px-2.5 py-1.5 border border-white/5">
                        <span className="text-[10px] text-slate-300">{t.name}</span>
                        <span className={`text-[10px] font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>{t.amt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Home bar */}
                <div className="h-5 flex items-center justify-center mt-2">
                  <div className="w-20 h-1 bg-slate-600 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Download Panel */}
          <div className="animate-fade-in space-y-6">
            {/* Android badge */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                {/* Android robot SVG */}
                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-emerald-400" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.523 15.341a.527.527 0 0 1-.527.527.527.527 0 0 1-.527-.527.527.527 0 0 1 .527-.527.527.527 0 0 1 .527.527zm-10.519 0a.527.527 0 0 1-.527.527.527.527 0 0 1-.527-.527.527.527 0 0 1 .527-.527.527.527 0 0 1 .527.527zM17.9 10.5l1.49-2.58a.311.311 0 0 0-.54-.312l-1.51 2.616A9.038 9.038 0 0 0 12 9.282a9.038 9.038 0 0 0-5.34 1.942L5.15 7.608a.311.311 0 0 0-.54.312L6.1 10.5C3.906 11.918 2.5 14.302 2.5 17h19c0-2.698-1.406-5.082-3.6-6.5z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-white">Android Application</p>
                <p className="text-xs text-slate-400">Compatible with Android 7.0+</p>
              </div>
            </div>

            {/* App details */}
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Info className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">App Details</span>
              </div>
              {APP_DETAILS.map((d) => (
                <div key={d.label} className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">{d.label}</span>
                  <span className="text-sm font-semibold text-white font-mono">{d.value}</span>
                </div>
              ))}
            </div>

            {/* APK availability indicator */}
            {apkAvailable === null && (
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                Checking file availability…
              </div>
            )}
            {apkAvailable === false && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
                <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">APK file unavailable</p>
                  <p className="text-xs text-rose-400 mt-0.5">The APK could not be found on the server. Please contact support.</p>
                </div>
              </div>
            )}

            {/* Download button */}
            {apkAvailable !== false && (
              <button
                onClick={handleDownload}
                disabled={downloading || apkAvailable === null}
                className={`
                  w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl
                  font-bold text-base transition-all duration-200 shadow-2xl
                  ${downloadDone
                    ? 'bg-emerald-600/80 border border-emerald-500/40 text-white shadow-emerald-700/20 scale-[0.99]'
                    : downloading || apkAvailable === null
                      ? 'bg-violet-800/50 border border-violet-500/20 text-slate-300 cursor-wait'
                      : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-600/30 hover:scale-[1.02] active:scale-[0.98]'
                  }
                `}
              >
                {downloadDone ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Download Started!
                  </>
                ) : downloading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Preparing Download…
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Download APK — v{APP_VERSION}
                  </>
                )}
              </button>
            )}

            {/* Error message */}
            {downloadError && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
                <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
                <p className="text-sm">{downloadError}</p>
              </div>
            )}

            {/* Install hint */}
            <p className="text-xs text-slate-500 leading-relaxed">
              <Package className="w-3.5 h-3.5 inline mr-1 opacity-60" />
              Enable <strong className="text-slate-400">Install from unknown sources</strong> in Android settings before installing the APK.
            </p>
          </div>
        </section>

        {/* ── Features Grid ── */}
        <section className="animate-fade-in">
          <h2 className="text-center text-2xl font-extrabold text-white font-heading mb-10">
            Everything in your pocket
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, label, color, bg, border }) => (
              <div
                key={label}
                className={`flex items-center gap-3 p-4 rounded-2xl ${bg} border ${border} hover:scale-[1.03] transition-transform duration-200`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg} border ${border} shrink-0`}>
                  <Icon className={`w-4.5 h-4.5 ${color}`} />
                </div>
                <span className="text-sm font-semibold text-slate-200">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Back link ── */}
        <div className="mt-20 text-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Command Center
          </Link>
        </div>
      </main>
    </div>
  );
};

export default DownloadApp;

