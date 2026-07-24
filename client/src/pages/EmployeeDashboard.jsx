import Layout from '../components/Layout';
import { getUser } from '../utils/auth';

const EmployeeDashboard = () => {
  const user = getUser();

  return (
    <Layout title="Dashboard">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="text-lg font-medium text-slate-800">
          Welcome back, {user?.name}!
        </h3>
        <p className="mt-2 text-slate-500">
          Your employee dashboard. Attendance and leave modules coming in Week 2.
        </p>
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;
