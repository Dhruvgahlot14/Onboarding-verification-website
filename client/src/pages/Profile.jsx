import { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { getUser } from '../utils/auth';

const Profile = () => {
  const currentUser = getUser();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/profile/me');
        setEmployee(data.employee);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Layout title="My Profile">
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="My Profile">
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      </Layout>
    );
  }

  const fields = [
    { label: 'Full Name', value: employee?.name },
    { label: 'Email', value: employee?.email },
    { label: 'Department', value: employee?.department || '—' },
    { label: 'Designation', value: employee?.designation || '—' },
    {
      label: 'Role',
      value: employee?.role?.replace('_', ' '),
    },
    {
      label: 'Status',
      value: employee?.isActive ? 'Active' : 'Inactive',
    },
  ];

  return (
    <Layout title="My Profile">
      <div className="mx-auto max-w-2xl rounded-xl bg-white dark:bg-slate-800 p-8 shadow-sm border border-transparent dark:border-slate-700 transition-colors">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {employee?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{employee?.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
              {employee?.role?.replace('_', ' ')} · {currentUser?.department}
            </p>
          </div>
        </div>

        <dl className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {fields.map(({ label, value }) => (
            <div key={label} className="flex py-4 transition-colors">
              <dt className="w-36 shrink-0 text-sm font-medium text-slate-500 dark:text-slate-400">{label}</dt>
              <dd className="text-sm capitalize text-slate-800 dark:text-slate-200">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Layout>
  );
};

export default Profile;
