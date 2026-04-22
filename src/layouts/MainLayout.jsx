import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Wallet, List, ArrowRightLeft, LogOut, ShieldAlert } from 'lucide-react';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Wallets', path: '/wallets', icon: Wallet },
    { name: 'Categories', path: '/categories', icon: List },
    { name: 'Transactions', path: '/transactions', icon: ArrowRightLeft },
  ];

  if (user?.role === "Admin") {
    navItems.push({ name: 'Admin Hub', path: '/admin', icon: ShieldAlert });
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 shadow-sm flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Wallet className="w-8 h-8" />
            FinTracker
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive
                    ? 'bg-indigo-50 text-primary'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-primary font-bold">
              {user.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-semibold text-slate-800 truncate">{user.fullName}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center px-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800">
            {navItems.find(item => item.path === location.pathname)?.name || 'Finance Tracker'}
          </h2>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
