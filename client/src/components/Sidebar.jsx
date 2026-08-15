import { NavLink, useNavigate } from 'react-router-dom';
import { getUser, clearAuth } from '../utils/auth';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  CalendarOff, 
  UserCircle, 
  Users, 
  FileBarChart,
  LogOut,
  X
} from 'lucide-react';

const navLinks = {
  employee: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/leave', label: 'Leave', icon: CalendarOff },
    { to: '/profile', label: 'Profile', icon: UserCircle },
  ],
  manager: [
    { to: '/manager', label: 'Team', icon: Users },
    { to: '/leave-approvals', label: 'Leave Approvals', icon: CalendarOff },
    { to: '/profile', label: 'Profile', icon: UserCircle },
  ],
  hr_admin: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/employees', label: 'Employees', icon: Users },
    { to: '/admin/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/admin/reports', label: 'Reports', icon: FileBarChart },
    { to: '/profile', label: 'Profile', icon: UserCircle },
  ],
};

const Sidebar = ({ isOpen, setIsOpen }) => {
  const user = getUser();
  const navigate = useNavigate();
  const links = navLinks[user?.role] || navLinks.employee;

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 shadow-xl md:shadow-sm md:relative transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-5 mb-4">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">NextGen Forge</h1>
            <p className="text-[10px] font-bold tracking-[0.2em] text-cyan-600/70 dark:text-cyan-400/70">TECHNOLOGY</p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      <div className="px-6 mb-2">
        <p className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">General</p>
      </div>

      <nav className="flex-1 space-y-1.5 px-4 py-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100'
                }`
              }
            >
              <Icon className="w-5 h-5" strokeWidth={2.5} />
              {link.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 mt-auto mb-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold text-slate-500 dark:text-slate-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
        >
          <LogOut className="w-5 h-5" strokeWidth={2.5} />
          Logout
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
