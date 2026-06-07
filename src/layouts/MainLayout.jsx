import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import {
  ShoppingBag,
  Heart,
  User as UserIcon,
  Moon,
  Sun,
  Menu,
  X,
  Search,
  ChevronDown,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import api from '../services/api.js';
import Footer from '../components/Footer';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('keyword') || ''
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?keyword=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/shop');
    }
    setIsMobileMenuOpen(false);
  };

  const handleCategoryClick = (catName) => {
    navigate(`/shop?category=${encodeURIComponent(catName)}`);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300 text-slate-800 dark:text-slate-100">
      {/* Dynamic Glassmorphic Navbar */}
      <header className="sticky top-0 z-50 glass shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo */}
            <div className="flex items-center">
              <Link
                to="/"
                className="flex items-center gap-2 text-2xl font-bold tracking-tight text-primary-600 dark:text-primary-400 hover:opacity-90 transition"
              >
                <ShoppingBag className="h-7 w-7 text-primary-600 dark:text-primary-400" />
                <span>E-Store</span>
              </Link>
            </div>

            {/* Desktop Navbar Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex items-center relative max-w-md w-full mx-8"
            >
              <input
                type="text"
                placeholder="Search products, brands, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
              <button
                type="submit"
                className="absolute right-3 top-2.5 text-slate-400 hover:text-primary-600 transition"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className="font-medium hover:text-primary-600 dark:hover:text-primary-400 transition"
              >
                Home
              </Link>
              <Link
                to="/shop"
                className="font-medium hover:text-primary-600 dark:hover:text-primary-400 transition"
              >
                Shop
              </Link>

              {/* Categories Menu */}
              <div className="relative group">
                <button className="flex items-center gap-1 font-medium hover:text-primary-600 dark:hover:text-primary-400 transition py-2">
                  <span>Categories</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-200">
                  <div className="py-2">
                    {categories.map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() => handleCategoryClick(cat.name)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-primary-50 dark:hover:bg-slate-800 hover:text-primary-600 transition"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </nav>

            {/* Utility Icons & Profile Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Dark Mode Switcher */}
              <button
                onClick={toggleTheme}
                className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition text-slate-500 dark:text-slate-400"
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              {/* Wishlist Link */}
              <Link
                to="/dashboard"
                className="relative p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition text-slate-500 dark:text-slate-400"
              >
                <Heart className="h-5 w-5" />
                {user?.wishlist?.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {user.wishlist.length}
                  </span>
                )}
              </Link>

              {/* Cart badged counter */}
              <Link
                to="/cart"
                className="relative p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition text-slate-500 dark:text-slate-400"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-primary-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Account Dropdown */}
              <div className="relative">
                {user ? (
                  <>
                    <button
                      onClick={() =>
                        setIsProfileDropdownOpen(!isProfileDropdownOpen)
                      }
                      className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-xl transition"
                    >
                      <img
                        src={
                          user.profileImage ||
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80'
                        }
                        alt="Profile"
                        className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                      />
                      <span className="text-sm font-medium hidden lg:inline">
                        {user.name}
                      </span>
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </button>

                    {isProfileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg py-2 text-sm z-50">
                        <Link
                          to="/dashboard"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          <UserIcon className="h-4 w-4" />
                          <span>My Dashboard</span>
                        </Link>
                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-primary-600 dark:text-primary-400"
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            <span>Admin Panel</span>
                          </Link>
                        )}
                        <hr className="border-slate-100 dark:border-slate-800 my-1" />
                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-red-600 text-left"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center gap-1.5 btn-primary text-sm font-semibold !py-2"
                  >
                    <UserIcon className="h-4 w-4" />
                    <span>Log In</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="flex items-center md:hidden gap-3">
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
              <Link to="/cart" className="relative p-2 text-slate-500">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-primary-600 text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Sidebar */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition duration-300">
            <div className="px-4 pt-4 pb-6 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-4 pr-10 text-sm"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-2.5 text-slate-400"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>

              {/* Navigation Links */}
              <div className="flex flex-col space-y-3 font-semibold text-base">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:text-primary-600"
                >
                  Home
                </Link>
                <Link
                  to="/shop"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:text-primary-600"
                >
                  Shop
                </Link>

                <div className="pt-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Shop Categories
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() => handleCategoryClick(cat.name)}
                        className="text-left px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-primary-50 hover:text-primary-600 transition"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <hr className="border-slate-100 dark:border-slate-800" />

              {/* Profile Details */}
              <div className="flex flex-col space-y-3">
                {user ? (
                  <>
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          user.profileImage ||
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80'
                        }
                        alt="Profile"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-sm font-medium hover:text-primary-600 block py-1"
                    >
                      My Dashboard
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-sm font-medium text-primary-600 block py-1"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        logout();
                      }}
                      className="text-sm font-semibold text-red-600 text-left block py-1"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center btn-primary py-2.5"
                  >
                    Log In / Sign Up
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Outlet Pages content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
