import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminAttendance from './pages/AdminAttendance';
import EmployeeDirectory from './pages/EmployeeDirectory';
import Profile from './pages/Profile';
import Attendance from './pages/Attendance';
import Layout from './components/Layout';
import { isAuthenticated, getUser, getRoleRedirect } from './utils/auth';

const Placeholder = ({ title }) => (
  <Layout title={title}>
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <p className="text-slate-500">{title} module is currently under construction.</p>
    </div>
  </Layout>
);

const RootRedirect = () => {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  const user = getUser();
  return <Navigate to={getRoleRedirect(user.role)} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RootRedirect />} />

        {/* Employee routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['employee']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute allowedRoles={['employee']}>
              <Attendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leave"
          element={
            <ProtectedRoute allowedRoles={['employee']}>
              <Placeholder title="Leave" />
            </ProtectedRoute>
          }
        />

        {/* Manager routes */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leave-approvals"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <Placeholder title="Leave Approvals" />
            </ProtectedRoute>
          }
        />

        {/* HR Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['hr_admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/employees"
          element={
            <ProtectedRoute allowedRoles={['hr_admin']}>
              <EmployeeDirectory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/attendance"
          element={
            <ProtectedRoute allowedRoles={['hr_admin']}>
              <AdminAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={['hr_admin']}>
              <Placeholder title="Reports" />
            </ProtectedRoute>
          }
        />

        {/* Shared profile route — all roles */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['employee', 'manager', 'hr_admin']}>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
