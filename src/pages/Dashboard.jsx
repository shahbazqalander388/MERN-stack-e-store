import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import Loader from '../components/Loader.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Toast from '../components/Toast.jsx';
import {
  User as UserIcon,
  ClipboardList,
  Heart,
  Settings,
  Lock,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck
} from 'lucide-react';

const Dashboard = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [toast, setToast] = useState(null);

  // Profile Form states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const { data } = await api.get('/orders/my-history');
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders history:', err);
      setToast({ message: 'Error loading orders', type: 'error' });
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      setToast({ message: 'Passwords do not match', type: 'error' });
      return;
    }

    try {
      setUpdatingProfile(true);
      const updatePayload = { name, email, profileImage };
      if (password) updatePayload.password = password;

      await updateProfile(updatePayload);
      setToast({ message: 'Profile updated successfully!', type: 'success' });
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Profile update failed',
        type: 'error'
      });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadingImage(true);
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfileImage(data.image);
      setToast({ message: 'Profile image uploaded!', type: 'success' });
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Image upload failed',
        type: 'error'
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      await api.put(`/orders/${orderId}/cancel`);
      setToast({ message: 'Order cancelled successfully', type: 'success' });
      // Re-fetch orders list
      fetchOrders();
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Order cancellation failed',
        type: 'error'
      });
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      Processing: {
        bg: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 border-blue-100 dark:border-blue-900/30',
        icon: Clock
      },
      Shipped: {
        bg: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 border-amber-100 dark:border-amber-900/30',
        icon: Truck
      },
      Delivered: {
        bg: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-100 dark:border-emerald-900/30',
        icon: CheckCircle2
      },
      Cancelled: {
        bg: 'bg-red-50 dark:bg-red-950/20 text-red-600 border-red-100 dark:border-red-900/30',
        icon: XCircle
      }
    };
    const config = configs[status] || configs.Processing;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 text-[11px] font-bold border px-2 py-0.5 rounded-full ${config.bg}`}>
        <Icon className="h-3 w-3" />
        <span>{status}</span>
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Banner introduction card */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center gap-6 mb-8 transition">
        <img
          src={
            user?.profileImage ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80'
          }
          alt={user?.name}
          className="h-20 w-20 rounded-full object-cover border-2 border-primary-500/20 shrink-0"
        />
        <div className="text-center md:text-left flex-grow">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Hello, {user?.name}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{user?.email}</p>
          <div className="flex gap-2 justify-center md:justify-start mt-3">
            <span className="bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
              Role: {user?.role}
            </span>
          </div>
        </div>
      </section>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Navigation Sidebar */}
        <aside className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              activeTab === 'orders'
                ? 'bg-primary-600 text-white shadow-md'
                : 'hover:bg-slate-50 dark:hover:bg-slate-850'
            }`}
          >
            <ClipboardList className="h-5 w-5" />
            <span>My Orders</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              activeTab === 'wishlist'
                ? 'bg-primary-600 text-white shadow-md'
                : 'hover:bg-slate-50 dark:hover:bg-slate-850'
            }`}
          >
            <Heart className="h-5 w-5" />
            <span>My Wishlist ({user?.wishlist?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              activeTab === 'profile'
                ? 'bg-primary-600 text-white shadow-md'
                : 'hover:bg-slate-50 dark:hover:bg-slate-850'
            }`}
          >
            <Settings className="h-5 w-5" />
            <span>Profile settings</span>
          </button>
        </aside>

        {/* Content Box */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* TAB 1: Order List */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-4">Order History</h2>
              {loadingOrders ? (
                <Loader className="py-12" />
              ) : orders.length === 0 ? (
                <div className="text-slate-400 italic py-6 text-center">
                  You haven't placed any orders yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord._id}
                      className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 hover:border-slate-300 transition"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div className="space-y-1">
                          <p className="text-xs text-slate-400 font-bold uppercase">
                            Order ID
                          </p>
                          <p className="text-xs font-semibold select-all">
                            {ord._id}
                          </p>
                        </div>
                        <div className="space-y-1 sm:text-right">
                          <p className="text-xs text-slate-400 font-bold uppercase">
                            Date Placed
                          </p>
                          <p className="text-xs font-semibold">
                            {new Date(ord.createdAt).toLocaleDateString(
                              undefined,
                              {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-between items-center gap-4">
                        <div className="flex gap-4 items-center">
                          <Package className="h-8 w-8 text-primary-550 shrink-0" />
                          <div>
                            <p className="text-xs font-bold uppercase text-slate-400">
                              Payment Total
                            </p>
                            <p className="text-sm font-extrabold">
                              ${ord.totalAmount.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {getStatusBadge(ord.orderStatus)}

                          {ord.orderStatus === 'Processing' && (
                            <button
                              onClick={() => handleCancelOrder(ord._id)}
                              className="text-xs font-semibold text-red-500 hover:text-red-600 hover:underline border border-red-200 dark:border-red-900/40 rounded-lg px-2.5 py-1"
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Wishlist Grid */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-4">My Wishlist</h2>
              {!user?.wishlist || user.wishlist.length === 0 ? (
                <div className="text-slate-400 italic py-6 text-center">
                  Your wishlist is empty.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {user.wishlist.map((prod) => (
                    <ProductCard
                      key={prod._id}
                      product={prod}
                      onShowToast={(msg, type) => setToast({ message: msg, type })}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Profile Management */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-4">Profile Settings</h2>

              <form onSubmit={handleProfileSubmit} className="space-y-5">
                {/* Image upload */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Profile Image
                  </label>
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        profileImage ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80'
                      }
                      alt="Avatar Preview"
                      className="h-16 w-16 rounded-full object-cover border"
                    />
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="avatar-upload"
                      />
                      <label
                        htmlFor="avatar-upload"
                        className="btn-secondary !py-2 !px-4 text-xs cursor-pointer inline-block"
                      >
                        {uploadingImage ? 'Uploading...' : 'Upload Image'}
                      </label>
                      <p className="text-[10px] text-slate-450 mt-1">
                        JPG, PNG, or WEBP. Max size 2MB.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                      required
                    />
                  </div>
                </div>

                <hr className="border-slate-100 dark:border-slate-800 my-4" />

                <div className="space-y-4">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Lock className="h-4.5 w-4.5" />
                    <h3 className="font-bold text-sm">Change Password</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        placeholder="Leave blank to keep current"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        placeholder="Leave blank to keep current"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="btn-primary text-sm flex items-center gap-2"
                >
                  {updatingProfile ? (
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
