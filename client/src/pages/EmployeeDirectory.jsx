import { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import AddEmployeeModal from '../components/AddEmployeeModal';
import EditEmployeeModal from '../components/EditEmployeeModal';

const EmployeeDirectory = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const fetchEmployees = async (searchQuery = '') => {
    setLoading(true);
    setError('');
    try {
      const params = searchQuery ? { search: searchQuery } : {};
      const { data } = await api.get('/employees', { params });
      setEmployees(data.employees);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEmployees(search);
  };

  const handleEmployeeCreated = () => {
    setShowAddModal(false);
    fetchEmployees(search);
  };

  const handleEmployeeUpdated = () => {
    setEditingEmployee(null);
    fetchEmployees(search);
  };

  return (
    <Layout title="Employee Directory">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, department..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 sm:w-80 transition-colors"
          />
          <button
            type="submit"
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Search
          </button>
        </form>
        <button
          onClick={() => setShowAddModal(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Add Employee
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="overflow-hidden rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-transparent dark:border-slate-700 transition-colors">
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : employees.length === 0 ? (
          <p className="py-16 text-center text-slate-500 dark:text-slate-400">No employees found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 transition-colors">
                <tr>
                  <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-400">Name</th>
                  <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-400">Email</th>
                  <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-400">Department</th>
                  <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-400">Designation</th>
                  <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-400">Role</th>
                  <th className="px-6 py-3 font-medium text-slate-600 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{emp.name}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{emp.email}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{emp.department || '—'}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{emp.designation || '—'}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-indigo-50 dark:bg-indigo-900/40 px-2 py-0.5 text-xs font-medium capitalize text-indigo-700 dark:text-indigo-400">
                        {emp.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setEditingEmployee(emp)}
                        className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleEmployeeCreated}
        />
      )}

      {editingEmployee && (
        <EditEmployeeModal
          employee={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onSuccess={handleEmployeeUpdated}
        />
      )}
    </Layout>
  );
};

export default EmployeeDirectory;
