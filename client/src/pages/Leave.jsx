import { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Leave = () => {
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'annual',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/leaves/mine');
      setLeaves(data.leaves);
      setBalance(data.balance);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load leave data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.post('/leaves', formData);
      setShowForm(false);
      setFormData({ leaveType: 'annual', startDate: '', endDate: '', reason: '' });
      toast.success('Leave request submitted successfully');
      await fetchData(); // Refresh data
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadgeColor = {
    pending: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-500',
    approved: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
    rejected: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
  };

  return (
    <Layout title="Leave Management">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Leave Balance & History</h2>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Manage your time off requests and view your balance.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
        >
          {showForm ? 'Cancel Request' : 'Request Leave'}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Balance Cards */}
      {!loading && balance && (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Annual Leave</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{balance.annualTotal - balance.annualUsed}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">/ {balance.annualTotal} days</p>
            </div>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Sick Leave</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{balance.sickTotal - balance.sickUsed}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">/ {balance.sickTotal} days</p>
            </div>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Casual Leave</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{balance.casualTotal - balance.casualUsed}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">/ {balance.casualTotal} days</p>
            </div>
          </div>
        </div>
      )}

      {/* Request Form */}
      {showForm && (
        <div className="mb-8 rounded-xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-top-4 transition-colors">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">New Leave Request</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Leave Type</label>
                <select
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  required
                >
                  <option value="annual">Annual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="casual">Casual Leave</option>
                </select>
              </div>
              <div className="hidden sm:block"></div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Reason</label>
                <textarea
                  name="reason"
                  rows="3"
                  value={formData.reason}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="Please briefly explain why you need this leave..."
                  required
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History Table */}
      <div className="overflow-hidden rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
        <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Leave History</h3>
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : leaves.length === 0 ? (
          <p className="py-16 text-center text-slate-500 dark:text-slate-400">No leave requests found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-400">Type</th>
                  <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-400">Dates</th>
                  <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-400">Reason</th>
                  <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {leaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200 capitalize">
                      {leave.leaveType}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={leave.reason}>
                      {leave.reason}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusBadgeColor[leave.status]}`}>
                        {leave.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Leave;
