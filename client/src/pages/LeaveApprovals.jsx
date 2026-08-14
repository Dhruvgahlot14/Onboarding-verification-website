import { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const LeaveApprovals = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchPendingLeaves = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/leaves/pending');
      setLeaves(data.leaves);
      setError('');
    } catch (err) {
      setError('Failed to load pending leave requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  const handleAction = async (id, status) => {
    setActionLoadingId(id);
    try {
      await api.put(`/leaves/${id}/status`, { status });
      // Optimistic update
      setLeaves(leaves.filter(leave => leave._id !== id));
      toast.success(`Leave request ${status} successfully`);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${status} request`);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <Layout title="Leave Approvals">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Pending Leave Requests</h2>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Review and manage leave requests from your team.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="overflow-hidden rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : leaves.length === 0 ? (
          <p className="py-16 text-center text-slate-500 dark:text-slate-400">No pending leave requests at the moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 transition-colors">
                <tr>
                  <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-400">Employee</th>
                  <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-400">Department</th>
                  <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-400">Type</th>
                  <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-400">Dates</th>
                  <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-400">Reason</th>
                  <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {leaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{leave.employeeId?.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{leave.employeeId?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {leave.employeeId?.department || '—'}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200 capitalize">
                      {leave.leaveType}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={leave.reason}>
                      {leave.reason}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleAction(leave._id, 'approved')}
                          disabled={actionLoadingId === leave._id}
                          className="rounded border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/40 px-3 py-1.5 text-xs font-semibold text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/60 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 disabled:opacity-50 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(leave._id, 'rejected')}
                          disabled={actionLoadingId === leave._id}
                          className="rounded border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/40 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-50 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
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

export default LeaveApprovals;
