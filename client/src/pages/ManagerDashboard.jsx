import { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';

const ManagerDashboard = () => {
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const { data } = await api.get('/leaves/pending');
        setPendingLeaves(data.leaves || []);
      } catch (err) {
        // Fallback to empty array if endpoint fails (e.g., before Week 3)
        setPendingLeaves([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaves();
  }, []);

  return (
    <Layout title="Manager Dashboard">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Team Overview</h2>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Manage your team and approve requests.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Leave Approvals</p>
              <p className="mt-2 text-2xl font-semibold text-slate-800 dark:text-slate-100">{pendingLeaves.length}</p>
            </div>
            {/* More manager KPIs can go here in the future */}
          </div>

          <div className="overflow-hidden rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
            <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Pending Leave Requests</h3>
            </div>
            {pendingLeaves.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                0 pending requests. Enjoy your day!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-400">Employee</th>
                      <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-400">Leave Type</th>
                      <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-400">Dates</th>
                      <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-400">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {pendingLeaves.map((leave) => (
                      <tr key={leave._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                          {leave.employeeId?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 capitalize">
                          {leave.leaveType}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                          {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                          {leave.reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
};

export default ManagerDashboard;
