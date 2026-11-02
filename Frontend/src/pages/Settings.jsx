import { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import Layout from '../components/Layout';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../components/Toast';
import { CURRENCIES } from '../utils/constants';
import {
  User,
  Shield,
  Palette,
  Trash2,
  Check,
  Key,
  Globe,
  Sun,
  Moon,
  AlertTriangle,
} from 'lucide-react';

const Settings = () => {
  const {
    user,
    theme,
    toggleTheme,
    currency,
    updateProfile,
    updatePassword,
    deleteAccount,
  } = useContext(AuthContext);

  const { showToast } = useToast();

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [selectedCurrency, setSelectedCurrency] = useState(currency || 'USD');
  const [dateFormat, setDateFormat] = useState(user?.dateFormat || 'YYYY-MM-DD');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Delete Account Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setSelectedCurrency(user.currency || currency || 'USD');
      setDateFormat(user.dateFormat || 'YYYY-MM-DD');
    }
  }, [user, currency]);

  // Handle Save Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    const res = await updateProfile({
      name,
      currency: selectedCurrency,
      dateFormat,
    });
    setProfileLoading(false);

    if (res.success) {
      showToast('Profile and currency preferences updated successfully!', 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    const res = await updatePassword(currentPassword, newPassword);
    setPasswordLoading(false);

    if (res.success) {
      showToast('Password changed successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordError(res.message);
      showToast(res.message, 'error');
    }
  };

  // Handle Delete Account
  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    const res = await deleteAccount();
    setDeleteLoading(false);
    if (res.success) {
      showToast('Account permanently removed.', 'info');
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <Layout title="Account & Preferences">
      <div className="max-w-4xl space-y-8 animate-fade-in pb-12">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-extrabold text-white font-heading tracking-tight">
            Settings & System Preferences
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure your display currency, authentication credentials, and theme
          </p>
        </div>

        {/* 1. Profile & Currency Configuration Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-heading">
                Profile & Financial Locale
              </h3>
              <p className="text-xs text-slate-400">
                Personal details and global currency formatting
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0B1020]/80 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                  Account Email (Verified)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-3 text-sm text-slate-400 cursor-not-allowed opacity-75"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                  Global Currency Display
                </label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="w-full bg-[#0B1020]/80 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all cursor-pointer"
                >
                  {Object.values(CURRENCIES).map((c) => (
                    <option key={c.code} value={c.code} className="bg-[#121A2B]">
                      {c.name} ({c.symbol})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1 ml-1">
                  Automatically formats every chart, summary, and ledger table.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                  Date Format
                </label>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="w-full bg-[#0B1020]/80 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all cursor-pointer"
                >
                  <option value="YYYY-MM-DD" className="bg-[#121A2B]">YYYY-MM-DD (ISO)</option>
                  <option value="DD/MM/YYYY" className="bg-[#121A2B]">DD/MM/YYYY (UK/India)</option>
                  <option value="MM/DD/YYYY" className="bg-[#121A2B]">MM/DD/YYYY (US)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={profileLoading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm shadow-lg shadow-violet-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {profileLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>Save Preferences</span>
              </button>
            </div>
          </form>
        </div>

        {/* 2. Visual Theme & Interface Mode */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-heading">
                  Theme Appearance
                </h3>
                <p className="text-xs text-slate-400">
                  Switch between Fintech Midnight Dark mode and High-Contrast Light mode
                </p>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-all"
            >
              {theme === 'dark' ? (
                <>
                  <Moon className="w-4 h-4 text-violet-400" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Light Mode</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3. Security & Password Update */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-heading">
                Security & Authentication Credentials
              </h3>
              <p className="text-xs text-slate-400">
                Update password with cryptographic verification
              </p>
            </div>
          </div>

          {passwordError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold">
              {passwordError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0B1020]/80 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                  New Password (min 6 chars)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#0B1020]/80 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#0B1020]/80 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={passwordLoading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-lg shadow-cyan-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {passwordLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Shield className="w-4 h-4" />
                )}
                <span>Update Password</span>
              </button>
            </div>
          </form>
        </div>

        {/* 4. Danger Zone: Delete Account */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border-rose-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Danger Zone: Account Termination</span>
              </div>
              <p className="text-xs text-slate-400 max-w-lg">
                Permanently purge your account, transaction ledger, and category budget ceilings from the database. This action cannot be reversed.
              </p>
            </div>

            <button
              onClick={() => setDeleteModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-all shadow-md shrink-0"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteLoading}
        title="Permanently Delete Account?"
        message="Are you completely sure? All your financial transactions, category budgets, and account records will be permanently expunged from the database."
        confirmText="Yes, Delete Everything"
        isDanger={true}
      />
    </Layout>
  );
};

export default Settings;
