import { Navigate } from 'react-router-dom';
import { getToken, getUser } from '../utils/auth';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const fallback =
      user.role === 'hr_admin'
        ? '/admin'
        : user.role === 'manager'
          ? '/manager'
          : '/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return children;
};

export default ProtectedRoute;
