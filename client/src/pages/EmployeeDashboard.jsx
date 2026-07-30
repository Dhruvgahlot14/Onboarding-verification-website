import { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { getUser } from '../utils/auth';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';

const EmployeeDashboard = () => {
  const user = getUser();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await api.get('/attendance/mine');
        setHistory(data.attendance || []);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const todayDateString = new Date().toDateString();
  const todayRecord = history.find(
    (record) => new Date(record.date).toDateString() === todayDateString
  );

  let todayStatus = 'Not Checked In';
  if (todayRecord) {
    if (todayRecord.checkIn && !todayRecord.checkOut) todayStatus = 'Checked In';
    if (todayRecord.checkOut) todayStatus = 'Completed';
  }

  // Calculate some simple KPIs for the current month
  const currentMonth = new Date().getMonth();
  const currentMonthRecords = history.filter(
    (r) => new Date(r.date).getMonth() === currentMonth
  );

  const daysPresent = currentMonthRecords.filter((r) => r.status === 'present' || r.status === 'half_day').length;
  const totalHoursThisMonth = currentMonthRecords.reduce((acc, r) => acc + (r.hoursWorked || 0), 0).toFixed(1);

  return (
    <Layout title="Dashboard">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Welcome back, {user?.name}!</h2>
          <p className="mt-1 text-slate-500">Here's your overview for today.</p>
        </div>
        <Link
          to="/attendance"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          Check In / Out
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* KPI 1 */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
              <p className="text-sm font-medium text-slate-500">Today's Status</p>
              <p className="mt-2 text-2xl font-semibold text-slate-800">{todayStatus}</p>
            </div>
            {/* KPI 2 */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
              <p className="text-sm font-medium text-slate-500">Days Present (This Month)</p>
              <p className="mt-2 text-2xl font-semibold text-slate-800">{daysPresent}</p>
            </div>
            {/* KPI 3 */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
              <p className="text-sm font-medium text-slate-500">Hours Worked (This Month)</p>
              <p className="mt-2 text-2xl font-semibold text-slate-800">{totalHoursThisMonth}h</p>
            </div>
            {/* KPI 4 */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
              <p className="text-sm font-medium text-slate-500">Leave Balance</p>
              <p className="mt-2 text-2xl font-semibold text-slate-800">--</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-slate-100">
            <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Recent Attendance</h3>
              <Link to="/attendance" className="text-sm text-indigo-600 font-medium hover:text-indigo-800">
                View All
              </Link>
            </div>
            {history.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">No recent activity.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3 font-medium text-slate-600">Date</th>
                      <th className="px-6 py-3 font-medium text-slate-600">Check In</th>
                      <th className="px-6 py-3 font-medium text-slate-600">Check Out</th>
                      <th className="px-6 py-3 font-medium text-slate-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.slice(0, 5).map((record) => (
                      <tr key={record._id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-medium text-slate-800">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                            record.status === 'present' ? 'bg-green-100 text-green-700' :
                            record.status === 'half_day' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {record.status.replace('_', ' ')}
                          </span>
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

export default EmployeeDashboard;
