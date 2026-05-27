import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountAPI } from '../api/account';
import Navbar from '../components/Navbar';

const colorMap = {
  blue: {
    border: 'hover:border-blue-500/50 hover:shadow-blue-500/10',
    text: 'group-hover:text-blue-400',
  },
  green: {
    border: 'hover:border-green-500/50 hover:shadow-green-500/10',
    text: 'group-hover:text-green-400',
  },
  purple: {
    border: 'hover:border-purple-500/50 hover:shadow-purple-500/10',
    text: 'group-hover:text-purple-400',
  },
};

const StatCard = ({ label, value, sub, color }) => {
  const colors = colorMap[color] || colorMap.blue;
  return (
    <div className={`group bg-linear-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer ${colors.border}`}>
      <p className="text-slate-400 text-sm mb-2 uppercase tracking-wider">{label}</p>
      <p className={`text-4xl font-bold text-white mb-1 transition-colors ${colors.text}`}>{value}</p>
      {sub && <p className="text-slate-500 text-xs">{sub}</p>}
    </div>
  );
};

const AccountCard = ({ account, balance, onCopy }) => {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(account._id);
    setCopied(true);
    onCopy && onCopy(account._id);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusColors = {
    Active: 'bg-green-500/10 text-green-400 border-green-500/20',
    Frozen: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Closed: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <div className="bg-linear-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-600 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group relative overflow-hidden">
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity shimmer" />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-5 relative z-10">
        <div>
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-1.5">Account ID</p>
          <div className="flex items-center gap-2">
            <p className="text-slate-300 font-mono text-sm font-medium">{account._id.slice(-12)}</p>
            <button
              onClick={copy}
              className="text-slate-600 hover:text-blue-400 transition-colors text-xs p-1 hover:bg-blue-500/10 rounded"
              title="Copy full ID"
            >
              {copied ? '✓' : '⧉'}
            </button>
          </div>
        </div>
        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${statusColors[account.status] || statusColors.Active}`}>
          {account.status}
        </span>
      </div>

      {/* Balance */}
      <div className="mb-5 relative z-10">
        <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Balance</p>
        <p className="text-4xl font-bold text-white group-hover:text-blue-400 transition-colors">
          {balance !== undefined
            ? `₹${Number(balance).toLocaleString('en-IN')}`
            : <span className="text-slate-600 text-2xl">Loading...</span>
          }
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800 relative z-10">
        <span className="text-slate-500 text-xs font-medium">{account.currency || 'INR'}</span>
        <span className="text-slate-600 text-xs">
          {new Date(account.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [accounts, setAccounts] = useState([]);
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const navigate = useNavigate();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchAll = useCallback(async () => {
    try {
      const data = await accountAPI.getAll();
      const list = data.accounts || [];
      setAccounts(list);

      const results = await Promise.all(
        list.map(a => accountAPI.getBalance(a._id).catch(() => ({ balance: 0 })))
      );
      const map = {};
      list.forEach((a, i) => { map[a._id] = results[i].balance; });
      setBalances(map);
    } catch {
      setError('Failed to load accounts. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleCreate = async () => {
    setCreating(true);
    setError('');
    try {
      await accountAPI.create();
      showToast('Account created successfully!');
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setCreating(false);
    }
  };

  const totalBalance = Object.values(balances).reduce((a, b) => a + (b || 0), 0);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-linear-to-r from-green-500/20 to-emerald-500/20 border border-green-500/40 text-green-400 px-5 py-3 rounded-xl text-sm shadow-2xl shadow-green-500/20 animate-slide-up backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg">✓</span>
            <span className="font-medium">{toast}</span>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-bold bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-slate-400 mt-2">Manage your accounts and transactions</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm flex items-center gap-3 animate-slide-up">
            <span className="text-lg">⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Total Balance"
            value={`₹${totalBalance.toLocaleString('en-IN')}`}
            sub="Across all accounts"
            color="blue"
          />
          <StatCard
            label="Total Accounts"
            value={accounts.length}
            sub="Active accounts"
            color="green"
          />
          <StatCard
            label="Currency"
            value="INR"
            sub="Indian Rupee"
            color="purple"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center gap-4 p-6 bg-linear-to-br from-blue-600/10 to-blue-600/5 border border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-600/20 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10"
          >
            <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform shadow-lg shadow-blue-600/30">
              {creating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '+'}
            </div>
            <div className="text-left">
              <p className="text-white font-semibold text-lg">{creating ? 'Creating...' : 'New Account'}</p>
              <p className="text-slate-400 text-xs">Open a bank account</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/transfer')}
            className="flex items-center gap-4 p-6 bg-linear-to-br from-green-600/10 to-green-600/5 border border-green-500/20 hover:border-green-500/50 hover:bg-green-600/20 rounded-2xl transition-all duration-300 group hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/10"
          >
            <div className="w-12 h-12 bg-linear-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform shadow-lg shadow-green-600/30">
              →
            </div>
            <div className="text-left">
              <p className="text-white font-semibold text-lg">Transfer</p>
              <p className="text-slate-400 text-xs">Send money</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/add-funds')}
            className="flex items-center gap-4 p-6 bg-linear-to-br from-purple-600/10 to-purple-600/5 border border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-600/20 rounded-2xl transition-all duration-300 group hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10"
          >
            <div className="w-12 h-12 bg-linear-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform shadow-lg shadow-purple-600/30">
              ₹
            </div>
            <div className="text-left">
              <p className="text-white font-semibold text-lg">Add Funds</p>
              <p className="text-slate-400 text-xs">System user only</p>
            </div>
          </button>
        </div>

        {/* Accounts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Your Accounts</h2>
            <button
              onClick={fetchAll}
              className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-1"
            >
              ↻ Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="text-5xl mb-4">🏦</div>
              <p className="text-white font-semibold text-lg mb-2">No accounts yet</p>
              <p className="text-slate-400 text-sm mb-6">Create your first account to get started</p>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all"
              >
                Create Account
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map(account => (
                <AccountCard
                  key={account._id}
                  account={account}
                  balance={balances[account._id]}
                  onCopy={() => showToast('Account ID copied!')}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
