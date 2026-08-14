import { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [pendingLeavesCount, setPendingLeavesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [empRes, attRes, leaveRes] = await Promise.all([
          api.get('/employees'),
          api.get('/attendance/all'),
          api.get('/leaves/pending').catch(() => ({ data: { count: 0 } }))
        ]);

        setEmployees(empRes.data.employees || []);
        setAttendance(attRes.data.attendance || []);
        setPendingLeavesCount(leaveRes.data?.count || 0);
      } catch (err) {
        setError('Failed to load HR dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute metrics
  const totalEmployees = employees.length;
  const presentToday = attendance.filter(a => a.status === 'present' || a.status === 'half_day').length;
  const attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;

  // Department Headcount
  const deptCount = employees.reduce((acc, emp) => {
    const dept = emp.department || 'Unassigned';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});
  const deptList = Object.entries(deptCount).sort((a, b) => b[1] - a[1]);

  return (
    <Layout title="HR Admin Dashboard">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Organization Overview</h2>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Key metrics and today's attendance tracking.</p>
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
          {/* KPIs */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Employees</p>
              <p className="mt-2 text-3xl font-bold text-slate-800 dark:text-slate-100">{totalEmployees}</p>
            </div>
            <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Today's Attendance Rate</p>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{attendanceRate}%</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">({presentToday} present)</p>
              </div>
            </div>
            <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Leave Requests</p>
              <p className="mt-2 text-3xl font-bold text-slate-800 dark:text-slate-100">{pendingLeavesCount}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Department Headcount */}
            <div className="overflow-hidden rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
              <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">Department Headcount</h3>
              </div>
              <div className="p-0">
                {deptList.length === 0 ? (
                  <p className="p-6 text-sm text-slate-500 dark:text-slate-400">No departments found.</p>
                ) : (
                  <ul className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {deptList.map(([dept, count]) => (
                      <li key={dept} className="flex justify-between items-center px-6 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{dept}</span>
                        <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {count}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default AdminDashboard;
