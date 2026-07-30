import { NavLink, useNavigate } from 'react-router-dom';
import { getUser, clearAuth } from '../utils/auth';

const navLinks = {
  employee: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/attendance', label: 'Attendance' },
    { to: '/leave', label: 'Leave' },
    { to: '/profile', label: 'Profile' },
  ],
  manager: [
    { to: '/manager', label: 'Team' },
    { to: '/leave-approvals', label: 'Leave Approvals' },
    { to: '/profile', label: 'Profile' },
  ],
  hr_admin: [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/employees', label: 'Employees' },
    { to: '/admin/attendance', label: 'Attendance' },
    { to: '/admin/reports', label: 'Reports' },
    { to: '/profile', label: 'Profile' },
  ],
};

const Sidebar = () => {
  const user = getUser();
  const navigate = useNavigate();
  const links = navLinks[user?.role] || navLinks.employee;

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <aside className="flex h-screen w-64 flex-col bg-slate-900 text-white">
      <div className="border-b border-slate-700 px-6 py-5">
        <h1 className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">NextGen Forge</h1>
        <p className="text-[10px] font-bold tracking-[0.2em] text-cyan-500/70 mb-4">TECHNOLOGY</p>
        <p className="mt-1 truncate text-xs text-slate-400">{user?.name}</p>
        <span className="mt-1 inline-block rounded-full bg-slate-700 px-2 py-0.5 text-xs capitalize text-slate-300">
          {user?.role?.replace('_', ' ')}
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-700 p-4">
        <button
          onClick={handleLogout}
          className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-red-600 hover:text-white"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
