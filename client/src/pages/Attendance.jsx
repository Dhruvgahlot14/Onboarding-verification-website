import { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';

const Attendance = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/attendance/mine');
      setHistory(data.attendance);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleCheckIn = async () => {
    setActionLoading(true);
    setError('');
    try {
      await api.post('/attendance/checkin');
      await fetchHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check in');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    setError('');
    try {
      await api.post('/attendance/checkout');
      await fetchHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check out');
    } finally {
      setActionLoading(false);
    }
  };

  // Determine today's status
  const todayDateString = new Date().toDateString();
  const todayRecord = history.find(
    (record) => new Date(record.date).toDateString() === todayDateString
  );

  let statusText = 'Not Checked In Yet';
  let canCheckIn = true;
  let canCheckOut = false;

  if (todayRecord) {
    if (todayRecord.checkIn && !todayRecord.checkOut) {
      const timeStr = new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      statusText = `Checked In at ${timeStr}`;
      canCheckIn = false;
      canCheckOut = true;
    } else if (todayRecord.checkIn && todayRecord.checkOut) {
      statusText = 'Completed for Today';
      canCheckIn = false;
      canCheckOut = false;
    }
  }

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = history.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(history.length / recordsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <Layout title="Attendance">
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Status Card */}
      <div className="mb-8 rounded-xl bg-white dark:bg-slate-800 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between border border-transparent dark:border-slate-700 transition-colors">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Today's Status</h3>
          <p className="mt-1 text-slate-500 dark:text-slate-400 font-medium">{statusText}</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <button
            onClick={handleCheckIn}
            disabled={!canCheckIn || actionLoading}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {actionLoading && canCheckIn ? <LoadingSpinner size="sm" /> : 'Check In'}
          </button>
          <button
            onClick={handleCheckOut}
            disabled={!canCheckOut || actionLoading}
            className="rounded-lg bg-slate-800 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {actionLoading && canCheckOut ? <LoadingSpinner size="sm" /> : 'Check Out'}
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="overflow-hidden rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-transparent dark:border-slate-700 transition-colors">
        <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Attendance History</h3>
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : history.length === 0 ? (
          <p className="py-16 text-center text-slate-500 dark:text-slate-400">No attendance records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-400">Date</th>
                  <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-400">Check In</th>
                  <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-400">Check Out</th>
                  <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-400">Hours</th>
                  <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {currentRecords.map((record) => (
                  <tr key={record._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {record.checkIn
                        ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {record.checkOut
                        ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {record.hoursWorked ? `${record.hoursWorked}h` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                          record.status === 'present'
                            ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                            : record.status === 'half_day'
                            ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-500'
                            : record.status === 'absent'
                            ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
                            : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400'
                        }`}
                      >
                        {record.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination Controls */}
        {!loading && history.length > recordsPerPage && (
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-3 transition-colors">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Showing <span className="font-medium">{indexOfFirstRecord + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(indexOfLastRecord, history.length)}
              </span>{' '}
              of <span className="font-medium">{history.length}</span> results
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="rounded border border-slate-300 dark:border-slate-600 px-3 py-1 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="rounded border border-slate-300 dark:border-slate-600 px-3 py-1 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Attendance;
