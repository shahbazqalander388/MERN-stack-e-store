import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Users,
  MessageSquare,
  ArrowLeft,
  Moon,
  Sun,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    {
      name: 'Overview',
      path: '/admin',
      icon: LayoutDashboard
    },
    {
      name: 'Products',
      path: '/admin?tab=products',
      icon: ShoppingBag
    },
    {
      name: 'Orders',
      path: '/admin?tab=orders',
      icon: ShoppingCart
    },
    {
      name: 'Users',
      path: '/admin?tab=users',
      icon: Users
    },
    {
      name: 'Reviews',
      path: '/admin?tab=reviews',
      icon: MessageSquare
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Determine active tab/path
  const currentTab = new URLSearchParams(location.search).get('tab') || '';
  const isActive = (itemPath) => {
    const itemTab = new URLSearchParams(itemPath.split('?')[1] || '').get(
      'tab'
    );
    return currentTab === (itemTab || '');
  };

  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 border-r border-slate-800 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-0 hidden'
        } lg:relative lg:translate-x-0 transition duration-300 flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2 font-bold text-white text-lg">
            <LayoutDashboard className="h-5 w-5 text-primary-500" />
            <span>Admin Console</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-grow py-6 px-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.path);
                  setIsSidebarOpen(false); // Close sidebar on mobile
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-200 ${
                  active
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-500/10'
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Link back to website */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-800 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Storefront</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area wrapper */}
      <div className="flex-grow flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold tracking-tight hidden sm:block">
              {currentTab
                ? `${
                    currentTab.charAt(0).toUpperCase() + currentTab.slice(1)
                  } Management`
                : 'Dashboard Overview'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800" />

            {/* Admin Avatar & Logout */}
            <div className="flex items-center gap-3">
              <img
                src={
                  user?.profileImage ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80'
                }
                alt="Admin Profile"
                className="h-9 w-9 rounded-full object-cover border border-slate-200 dark:border-slate-800"
              />
              <div className="hidden md:block text-left">
                <p className="text-xs text-slate-400 font-medium">Administrator</p>
                <p className="text-sm font-semibold">{user?.name || 'Admin'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-red-500 transition"
                title="Log Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Inner Tab Views */}
        <main className="flex-grow p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
