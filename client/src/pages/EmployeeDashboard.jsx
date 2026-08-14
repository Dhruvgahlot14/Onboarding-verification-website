import { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { getUser } from '../utils/auth';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';
import { Download, Edit2, Calendar } from 'lucide-react';

const EmployeeDashboard = () => {
  const user = getUser();
  const [history, setHistory] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [attendanceRes, leaveRes] = await Promise.all([
          api.get('/attendance/mine'),
          api.get('/leaves/mine').catch(() => ({ data: { balance: null } }))
        ]);
        setHistory(attendanceRes.data.attendance || []);
        setBalance(leaveRes.data?.balance || null);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const currentMonth = new Date().getMonth();
  const currentMonthRecords = history.filter(
    (r) => new Date(r.date).getMonth() === currentMonth
  );

  const daysPresent = currentMonthRecords.filter((r) => r.status === 'present' || r.status === 'half_day').length;
  const totalHoursThisMonth = currentMonthRecords.reduce((acc, r) => acc + (r.hoursWorked || 0), 0).toFixed(1);

  let totalLeaveRemaining = '--';
  if (balance) {
    const totalAllocated = balance.annualTotal + balance.sickTotal + balance.casualTotal;
    const totalUsed = balance.annualUsed + balance.sickUsed + balance.casualUsed;
    totalLeaveRemaining = totalAllocated - totalUsed;
  }

  // Calculate Average Clock-In
  const checkInTimes = currentMonthRecords.filter(r => r.checkIn).map(r => new Date(r.checkIn).getHours() + new Date(r.checkIn).getMinutes() / 60);
  const avgClockInRaw = checkInTimes.length ? (checkInTimes.reduce((a, b) => a + b, 0) / checkInTimes.length) : null;
  const avgClockInStr = avgClockInRaw ? `${Math.floor(avgClockInRaw)}:${String(Math.floor((avgClockInRaw % 1) * 60)).padStart(2, '0')} am` : '--';

  const handleDownloadInfo = () => {
    const info = `Employee Name: ${user?.name}\nEmail: ${user?.email}\nRole: ${user?.role}\nDepartment: ${user?.department || 'Engineering'}\nTotal Leaves: ${totalLeaveRemaining}\n`;
    const blob = new Blob([info], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${user?.name.replace(' ', '_')}_Info.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadReport = () => {
    if (history.length === 0) return;
    const headers = ['Date', 'Check In', 'Check Out', 'Hours Worked', 'Status'];
    const rows = history.map(record => {
      const date = new Date(record.date).toLocaleDateString();
      const checkIn = record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '--:--';
      const checkOut = record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '--:--';
      const hours = typeof record.hoursWorked === 'number' ? record.hoursWorked.toFixed(2) : '0.00';
      return [date, checkIn, checkOut, hours, record.status];
    });
    
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout title="Employee Dashboard">
      
      {/* Top Action Bar */}
      <div className="flex justify-end gap-3 mb-6">
        <button className="flex items-center gap-2 rounded-full bg-white dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors">
          <Calendar className="w-4 h-4" />
          November 2025
        </button>
        <Link to="/leave" className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20">
          + Add Time Off
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Top Section: Details & KPIs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            
            {/* Left: Employee Details Card */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between transition-colors">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg">Employee Details</h3>
                </div>
                <div className="flex gap-2">
                  <Link to="/profile" className="p-2 rounded-full bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </Link>
                  <button onClick={handleDownloadInfo} className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20">
                    <Download className="w-4 h-4" />
                    Download Info
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-8 mt-2">
                <div className="relative shrink-0">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${user?.name}&background=random&size=128&rounded=true`} 
                    alt="Avatar" 
                    className="w-24 h-24 rounded-full shadow-md border-4 border-white"
                  />
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full border-2 border-white shadow-sm whitespace-nowrap">
                    Fulltime
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8 w-full">
                  <div className="col-span-2 md:col-span-3">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{user?.name}</h2>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wider">Role</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">{user?.designation || user?.role?.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wider">Email Address</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wider">Department</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{user?.department || 'Engineering'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: 2x2 KPI Grid */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-6 transition-colors">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Attendance</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">{daysPresent}</span>
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500">days</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Hours</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">{totalHoursThisMonth}</span>
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500">hrs</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Avg Clock-in</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{avgClockInStr.split(' ')[0]}</span>
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{avgClockInStr.split(' ')[1] || ''}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Leave Balance</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{totalLeaveRemaining}</span>
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500">days</span>
                </div>
              </div>
            </div>

          </div>

          {/* Attendance History Table */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg">Attendance History</h3>
              <div className="flex gap-2">
                <button onClick={handleDownloadReport} className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20">
                  <Download className="w-4 h-4" />
                  Download Report
                </button>
              </div>
            </div>

            {history.length === 0 ? (
              <p className="py-12 text-center text-sm font-medium text-slate-400 dark:text-slate-500">No attendance records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-slate-700">
                    <tr>
                      <th className="pb-4 pl-4 font-medium">Date</th>
                      <th className="pb-4 font-medium">Timeline</th>
                      <th className="pb-4 font-medium">Status</th>
                      <th className="pb-4 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                    {history.slice(0, 7).map((record) => {
                      const dateObj = new Date(record.date);
                      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                      const dateString = dateObj.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
                      
                      const checkIn = record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase() : '--:--';
                      const checkOut = record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase() : '--:--';

                      return (
                        <tr key={record._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                          <td className="py-5 pl-4">
                            <div className="flex items-center gap-3">
                              <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs px-2.5 py-1 rounded-full">{dayName}</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{dateString}</span>
                            </div>
                          </td>
                          <td className="py-5">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <div className="w-1 h-4 bg-green-500 rounded-full"></div>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{checkIn} - {checkOut}</span>
                              </div>
                              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium ml-3 mt-0.5">Work: {record.hoursWorked?.toFixed(1) || 0} hours</span>
                            </div>
                          </td>
                          <td className="py-5">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold capitalize shadow-sm border
                              ${record.status === 'present' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-100 dark:border-green-800/50' :
                                record.status === 'half_day' ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-800/50' :
                                'bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-700'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${record.status === 'present' ? 'bg-green-500' : record.status === 'half_day' ? 'bg-orange-500' : 'bg-slate-400'}`}></span>
                              {record.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-5">
                            <Link to="/attendance" className="text-xs font-bold text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity">
                              View Details
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
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
