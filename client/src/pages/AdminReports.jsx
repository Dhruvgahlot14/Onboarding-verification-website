import { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminReports = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const { data } = await api.get('/leaves/all');
        setLeaves(data.leaves || []);
      } catch (err) {
        setError('Failed to load reports data');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaves();
  }, []);

  const exportAttendanceCSV = async () => {
    try {
      toast.loading('Generating CSV...', { id: 'csv-export' });
      const { data } = await api.get('/attendance/all?allTime=true');
      const attendance = data.attendance || [];
      
      if (attendance.length === 0) {
        toast.error('No attendance data to export', { id: 'csv-export' });
        return;
      }

      // Headers
      const headers = ['Employee Name', 'Date', 'Status', 'Check In', 'Check Out', 'Hours Worked'];
      
      // Rows
      const csvRows = attendance.map(record => [
        record.userId?.name || 'Unknown',
        new Date(record.date).toLocaleDateString(),
        record.status,
        record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '',
        record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '',
        typeof record.hoursWorked === 'number' ? record.hoursWorked.toFixed(2) : '0.00'
      ]);

      // Combine
      const csvContent = [
        headers.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Export successful!', { id: 'csv-export' });
    } catch (err) {
      toast.error('Failed to export data', { id: 'csv-export' });
    }
  };

  return (
    <Layout title="Reports & Analytics">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Company Reports</h2>
          <p className="mt-1 text-slate-500 dark:text-slate-400">View and export company-wide data.</p>
        </div>
        <button
          onClick={exportAttendanceCSV}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 w-full sm:w-auto text-center"
        >
          Export Attendance CSV
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Company Leave Summary</h3>
          </div>
          {leaves.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">No leave requests found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-400">Employee</th>
                    <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-400">Leave Type</th>
                    <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-400">Dates</th>
                    <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {leaves.map((leave) => (
                    <tr key={leave._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                        {leave.employeeId?.name || 'Unknown'}
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-normal">{leave.employeeId?.department || 'No Dept'}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 capitalize">
                        {leave.leaveType}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                          leave.status === 'approved' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' :
                          leave.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400' :
                          'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-500'
                        }`}>
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
      )}
    </Layout>
  );
};

export default AdminReports;
