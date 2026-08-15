import Sidebar from './Sidebar';
import { Search, Bell, Moon, Sun, Menu } from 'lucide-react';
import { getUser } from '../utils/auth';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';

const Layout = ({ children, title, subtitle }) => {
  const user = getUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  return (
    <div className="flex h-screen bg-[#F0F4F8] dark:bg-slate-900 overflow-hidden transition-colors duration-200">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Navigation */}
        <header className="flex h-20 items-center justify-between px-4 md:px-8 bg-transparent shrink-0">
          
          <div className="flex items-center gap-4 flex-1">
            {/* Hamburger Menu (Mobile Only) */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Left: Search Bar */}
            <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-white dark:bg-slate-800 rounded-full py-2.5 pl-10 pr-4 text-sm outline-none border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
              />
            </div>
          </div>

          {/* Right: Actions & Profile */}
          <div className="flex items-center gap-6 ml-4">
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                <Bell className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Dropdown Simulation */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
              <img 
                src={`https://ui-avatars.com/api/?name=${user?.name}&background=0D8ABC&color=fff`} 
                alt="Profile" 
                className="w-10 h-10 rounded-full shadow-sm"
              />
              <div className="hidden md:block">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">{user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8 max-w-7xl mx-auto pb-24">
            {title && (
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{title}</h2>
                {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
              </div>
            )}
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
