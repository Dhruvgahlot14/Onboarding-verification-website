import { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTodayAttendance = async () => {
      try {
        const [empRes, attRes] = await Promise.all([
          api.get('/employees'),
          api.get('/attendance/all')
        ]);
        
        const allEmployees = empRes.data.employees || [];
        const attendanceRecords = attRes.data.attendance || [];
        
        // Merge to ensure all employees are listed
        const merged = allEmployees.map(emp => {
          const record = attendanceRecords.find(a => a.userId?._id === emp._id || a.userId === emp._id);
          if (record) {
            // Keep the populated userId object from the attendance record if it exists
            return record;
          }
          // Create a synthetic record for employees who haven't checked in
          return {
            _id: `synthetic-${emp._id}`,
            userId: emp,
            status: 'absent',
            checkIn: null,
            checkOut: null,
            hoursWorked: null
          };
        });

        setAttendance(merged);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load today\'s attendance');
      } finally {
        setLoading(false);
      }
    };

    fetchTodayAttendance();
  }, []);

  return (
    <Layout title="Today's Attendance">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Organisation Attendance</h2>
        <p className="mt-1 text-slate-500">Monitor today's employee check-ins and statuses.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-slate-100">
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between bg-slate-50">
          <h3 className="font-semibold text-slate-800">
            Attendance for {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h3>
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : attendance.length === 0 ? (
          <p className="py-16 text-center text-slate-500">No attendance activity recorded today.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 font-medium text-slate-600">Employee</th>
                  <th className="px-6 py-3 font-medium text-slate-600">Email</th>
                  <th className="px-6 py-3 font-medium text-slate-600">Department</th>
                  <th className="px-6 py-3 font-medium text-slate-600">Check In</th>
                  <th className="px-6 py-3 font-medium text-slate-600">Check Out</th>
                  <th className="px-6 py-3 font-medium text-slate-600">Hours</th>
                  <th className="px-6 py-3 font-medium text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendance.map((record) => (
                  <tr key={record._id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {record.userId?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {record.userId?.email || '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {record.userId?.department || '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {record.hoursWorked ? `${record.hoursWorked}h` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                        record.status === 'present' ? 'bg-green-100 text-green-700' :
                        record.status === 'half_day' ? 'bg-yellow-100 text-yellow-700' :
                        record.status === 'absent' ? 'bg-red-100 text-red-700' :
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
    </Layout>
  );
};

export default AdminAttendance;
