import Layout from '../components/Layout';

const ManagerDashboard = () => {
  return (
    <Layout title="Team">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="text-lg font-medium text-slate-800">Team Overview</h3>
        <p className="mt-2 text-slate-500">
          Team management and leave approvals coming in Week 2.
        </p>
      </div>
    </Layout>
  );
};

export default ManagerDashboard;
