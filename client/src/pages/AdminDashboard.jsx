import Layout from '../components/Layout';

const AdminDashboard = () => {
  return (
    <Layout title="HR Dashboard">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="text-lg font-medium text-slate-800">HR Admin Dashboard</h3>
        <p className="mt-2 text-slate-500">
          KPI cards and reports coming in later weeks. Use the Employees section to manage staff.
        </p>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
