import Sidebar from './Sidebar';

const Layout = ({ children, title }) => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {title && (
          <header className="border-b border-slate-200 bg-white px-8 py-5">
            <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
          </header>
        )}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
