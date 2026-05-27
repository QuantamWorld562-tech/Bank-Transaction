import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountAPI } from '../api/account';
import { transactionAPI } from '../api/transaction';
import Navbar from '../components/Navbar';

const AddFunds = () => {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ toAccount: '', amount: '' });
  const [loading, setLoading] = useState(false);
  const [fetchingAccounts, setFetchingAccounts] = useState(true);
  const [status, setStatus] = useState(null);
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
    try {
      const result = await transactionAPI.addFunds({
        ...form,
        amount: parseFloat(form.amount),
        idempotencyKey: `init-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      });
      setStatus({ type: 'success', msg: result.message || 'Funds added successfully!' });
      setForm({ toAccount: '', amount: '' });
      setTimeout(() => navigate('/dashboard'), 2500);
    } catch (err) {
      setStatus({
        type: 'error',
        msg: err.response?.data?.message || 'Failed. Make sure you have system user privileges.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Add Initial Funds</h1>
          <p className="text-slate-400 mt-1">Credit an account with initial balance</p>
        </div>

        {/* Warning */}
        <div className="mb-6 flex items-start gap-3 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
          <span className="text-yellow-400 text-lg">⚠</span>
          <div className="text-sm">
            <p className="text-yellow-400 font-medium mb-0.5">System User Only</p>
            <p className="text-slate-400">
              This feature requires <code className="bg-slate-800 px-1.5 py-0.5 rounded text-yellow-300 text-xs">systemUser: true</code> in your MongoDB user document.
              After setting it, logout and login again.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Account to Credit</label>
              {fetchingAccounts ? (
                <div className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-500 text-sm">
                  Loading accounts...
                </div>
              ) : (
                <select
                  required
                  value={form.toAccount}
                  onChange={e => setForm({ ...form, toAccount: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                >
                  <option value="">Select account</option>
                  {accounts.map(a => (
                    <option key={a._id} value={a._id}>
                      ...{a._id.slice(-10)} — {a.status}
                    </option>
                  ))}
                </select>
              )}
            </div>

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
                  className="w-full pl-8 pr-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder-slate-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/40 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-purple-600/20 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding Funds...
                </>
              ) : 'Add Funds ₹'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddFunds;
