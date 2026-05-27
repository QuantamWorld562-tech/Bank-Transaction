import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountAPI } from '../api/account';
import { transactionAPI } from '../api/transaction';
import Navbar from '../components/Navbar';

const Transfer = () => {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ fromAccount: '', toAccount: '', amount: '' });
  const [loading, setLoading] = useState(false);
  const [fetchingAccounts, setFetchingAccounts] = useState(true);
  const [status, setStatus] = useState(null); // { type: 'success'|'error', msg }
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    accountAPI.getAll()
      .then(d => setAccounts(d.accounts || []))
      .catch(() => {})
      .finally(() => setFetchingAccounts(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    setProgress(0);

    // Simulate progress bar during 15s wait
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 90) { clearInterval(interval); return 90; }
        return p + 6;
      });
    }, 1000);

    try {
      const result = await transactionAPI.transfer({
        ...form,
        amount: parseFloat(form.amount),
        idempotencyKey: `txn-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      });
      clearInterval(interval);
      setProgress(100);
      setStatus({ type: 'success', msg: result.message || 'Transfer completed!' });
      setForm({ fromAccount: '', toAccount: '', amount: '' });
      setTimeout(() => navigate('/dashboard'), 2500);
    } catch (err) {
      clearInterval(interval);
      setProgress(0);
      setStatus({ type: 'error', msg: err.response?.data?.message || 'Transfer failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Transfer Money</h1>
          <p className="text-slate-400 mt-1">Send funds to another account</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          {/* Status */}
          {status && (
            <div className={`mb-6 p-4 rounded-xl text-sm flex items-start gap-3 border ${
              status.type === 'success'
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              <span className="text-lg">{status.type === 'success' ? '✓' : '⚠'}</span>
              <div>
                <p className="font-medium">{status.type === 'success' ? 'Success!' : 'Error'}</p>
                <p className="opacity-80">{status.msg}</p>
                {status.type === 'success' && <p className="text-xs mt-1 opacity-60">Redirecting to dashboard...</p>}
              </div>
            </div>
          )}

          {/* Progress bar */}
          {loading && (
            <div className="mb-6">
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>Processing transaction...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-slate-500 text-xs mt-2">This may take up to 15 seconds. Please wait.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* From Account */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">From Account</label>
              {fetchingAccounts ? (
                <div className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-500 text-sm">
                  Loading accounts...
                </div>
              ) : (
                <select
                  required
                  value={form.fromAccount}
                  onChange={e => setForm({ ...form, fromAccount: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="">Select your account</option>
                  {accounts.map(a => (
                    <option key={a._id} value={a._id}>
                      ...{a._id.slice(-10)} — {a.status}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* To Account */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">To Account ID</label>
              <input
                type="text"
                required
                value={form.toAccount}
                onChange={e => setForm({ ...form, toAccount: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-500 font-mono text-sm"
                placeholder="Paste recipient account ID"
              />
              <p className="text-slate-500 text-xs mt-1.5">Ask the recipient to copy their account ID from the dashboard</p>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  className="w-full pl-8 pr-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Info box */}
            <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
              <span className="text-blue-400 text-lg">ℹ</span>
              <div className="text-sm text-slate-400">
                <p className="text-blue-400 font-medium mb-0.5">Processing time</p>
                Transactions take approximately 15 seconds to process. Do not close this page.
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-green-600 hover:bg-green-500 disabled:bg-green-600/40 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-green-600/20 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : 'Send Money →'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Transfer;
