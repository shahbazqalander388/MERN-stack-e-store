import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api.js';
import Loader from '../components/Loader.jsx';
import Toast from '../components/Toast.jsx';
import {
  DollarSign,
  ShoppingBag,
  ShoppingCart,
  Users,
  Plus,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Check,
  X,
  Upload,
  Calendar,
  MessageSquare
} from 'lucide-react';

const AdminDashboard = () => {
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || '';

  // Stats / Analytics States
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Management Lists States
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingTab, setLoadingTab] = useState(false);
  const [toast, setToast] = useState(null);

  // Modals States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatImage, setNewCatImage] = useState('');
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

  // Product Form States
  const [prodTitle, setProdTitle] = useState('');
  const [prodPrice, setProdPrice] = useState(0);
  const [prodDesc, setProdDesc] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodStock, setProdStock] = useState(0);
  const [isSubmittingProd, setIsSubmittingProd] = useState(false);
  const [uploadingProdImage, setUploadingProdImage] = useState(false);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const { data } = await api.get('/orders/admin/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
      setToast({ message: 'Error loading analytical statistics', type: 'error' });
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchTabData = async () => {
    try {
      setLoadingTab(true);
      if (currentTab === 'products') {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products?limit=100'),
          api.get('/categories')
        ]);
        setProducts(prodRes.data.products);
        setCategories(catRes.data);
      } else if (currentTab === 'orders') {
        const { data } = await api.get('/orders');
        setOrders(data);
      } else if (currentTab === 'users') {
        const { data } = await api.get('/users');
        setUsers(data);
      } else if (currentTab === 'reviews') {
        const { data } = await api.get('/products/reviews/all');
        setReviews(data);
      }
    } catch (err) {
      console.error('Failed to load tab data:', err);
      setToast({ message: 'Error fetching management logs', type: 'error' });
    } finally {
      setLoadingTab(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (currentTab) {
      fetchTabData();
    }
  }, [currentTab]);

  const openAddProduct = () => {
    setEditingProduct(null);
    setProdTitle('');
    setProdPrice(0);
    setProdDesc('');
    setProdImage('');
    setProdCategory(categories[0]?.name || 'Electronics');
    setProdBrand('');
    setProdStock(0);
    setIsProductModalOpen(true);
  };

  const openEditProduct = (prod) => {
    setEditingProduct(prod);
    setProdTitle(prod.title);
    setProdPrice(prod.price);
    setProdDesc(prod.description);
    setProdImage(prod.images[0] || '');
    setProdCategory(prod.category);
    setProdBrand(prod.brand);
    setProdStock(prod.stock);
    setIsProductModalOpen(true);
  };

  const handleProductImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadingProdImage(true);
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProdImage(data.image);
      setToast({ message: 'Product image uploaded successfully!', type: 'success' });
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Image upload failed',
        type: 'error'
      });
    } finally {
      setUploadingProdImage(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();

    if (!prodTitle || !prodPrice || !prodDesc || !prodCategory || !prodBrand) {
      setToast({ message: 'Please enter all fields', type: 'error' });
      return;
    }

    const payload = {
      title: prodTitle,
      price: Number(prodPrice),
      description: prodDesc,
      images: [prodImage || '/uploads/sample.jpg'],
      category: prodCategory,
      brand: prodBrand,
      stock: Number(prodStock)
    };

    try {
      setIsSubmittingProd(true);
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
        setToast({ message: 'Product updated successfully!', type: 'success' });
      } else {
        await api.post('/products', payload);
        setToast({ message: 'Product added successfully!', type: 'success' });
      }
      setIsProductModalOpen(false);
      fetchTabData();
      fetchStats(); // Update totals
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Failed to submit product data',
        type: 'error'
      });
    } finally {
      setIsSubmittingProd(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;

    try {
      await api.delete(`/products/${id}`);
      setToast({ message: 'Product deleted successfully', type: 'success' });
      fetchTabData();
      fetchStats();
    } catch (err) {
      setToast({ message: 'Failed to delete product', type: 'error' });
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName || !newCatImage) return;

    try {
      setIsSubmittingCat(true);
      await api.post('/categories', { name: newCatName, image: newCatImage });
      setToast({ message: 'Category added!', type: 'success' });
      setNewCatName('');
      setNewCatImage('');
      fetchTabData();
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Failed to add category',
        type: 'error'
      });
    } finally {
      setIsSubmittingCat(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category? Products won\'t be deleted.')) return;

    try {
      await api.delete(`/categories/${id}`);
      setToast({ message: 'Category deleted', type: 'success' });
      fetchTabData();
    } catch (err) {
      setToast({ message: 'Failed to delete category', type: 'error' });
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      setToast({ message: `Order status updated to ${newStatus}`, type: 'success' });
      fetchTabData();
      fetchStats();
    } catch (err) {
      setToast({ message: 'Failed to update order status', type: 'error' });
    }
  };

  const handleToggleBlockUser = async (userId) => {
    try {
      const { data } = await api.put(`/users/${userId}/block`);
      setToast({ message: data.message, type: 'success' });
      fetchTabData();
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Failed to toggle block status',
        type: 'error'
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user account permanently?')) return;

    try {
      await api.delete(`/users/${userId}`);
      setToast({ message: 'User deleted successfully', type: 'success' });
      fetchTabData();
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Failed to delete user',
        type: 'error'
      });
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this customer review?')) return;

    try {
      await api.delete(`/products/reviews/${reviewId}`);
      setToast({ message: 'Review deleted successfully', type: 'success' });
      fetchTabData();
    } catch (err) {
      setToast({ message: 'Failed to delete review', type: 'error' });
    }
  };

  if (loadingStats) return <Loader className="min-h-[60vh]" />;

  return (
    <div className="space-y-8">
      {/* 1. TAB VIEW: OVERVIEW */}
      {currentTab === '' && stats && (
        <div className="space-y-8 animate-fade-in">
          {/* Dashboard Metrics grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-450 font-bold uppercase tracking-wider">
                  Total Revenue
                </p>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 mt-1">
                  ${stats.totalRevenue.toFixed(2)}
                </h3>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-450 font-bold uppercase tracking-wider">
                  Total Orders
                </p>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 mt-1">
                  {stats.totalOrders}
                </h3>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-450 font-bold uppercase tracking-wider">
                  Total Products
                </p>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 mt-1">
                  {stats.totalProducts}
                </h3>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-450 font-bold uppercase tracking-wider">
                  Total Customers
                </p>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 mt-1">
                  {stats.totalUsers}
                </h3>
              </div>
            </div>
          </div>

          {/* High Fidelity Visual Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart A: Monthly Revenue Bar chart */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between min-h-[350px]">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary-550" />
                  <span>Monthly Sales Report</span>
                </h3>
                <p className="text-xs text-slate-400">Total gross earnings aggregated by calendar month</p>
              </div>

              {stats.monthlyRevenue.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm italic">No sales logs recorded yet.</div>
              ) : (
                <div className="flex items-end justify-between gap-2 h-48 pt-6 border-b border-l border-slate-200 dark:border-slate-800 px-4">
                  {stats.monthlyRevenue.map((m) => {
                    const maxVal = Math.max(...stats.monthlyRevenue.map((x) => x.revenue), 1);
                    const percent = (m.revenue / maxVal) * 100;
                    return (
                      <div key={m._id} className="flex flex-col items-center flex-grow group relative">
                        {/* Tooltip */}
                        <span className="absolute -top-10 bg-slate-950 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition z-10 pointer-events-none font-bold">
                          ${m.revenue.toFixed(2)}
                        </span>
                        {/* Bar */}
                        <div
                          style={{ height: `${percent}%` }}
                          className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg group-hover:opacity-90 transition duration-300 min-h-[10px]"
                        />
                        {/* Date */}
                        <span className="text-[10px] text-slate-400 mt-2 font-bold rotate-12">{m._id}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Chart B: Top Selling Products */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 min-h-[350px]">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary-550" />
                  <span>Top Selling Products</span>
                </h3>
                <p className="text-xs text-slate-400">Products with highest quantities purchased</p>
              </div>

              {stats.topProducts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm italic">No sales logs recorded yet.</div>
              ) : (
                <div className="space-y-4 pt-4">
                  {stats.topProducts.map((p) => {
                    const maxQty = Math.max(...stats.topProducts.map((x) => x.qtySold), 1);
                    const percent = (p.qtySold / maxQty) * 100;
                    return (
                      <div key={p._id} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="truncate max-w-[200px]">{p.title}</span>
                          <span className="text-primary-600 dark:text-primary-400 shrink-0">
                            {p.qtySold} units (${p.revenue.toFixed(2)})
                          </span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${percent}%` }}
                            className="h-full bg-primary-600 rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. TAB VIEW: PRODUCTS MANAGEMENT */}
      {currentTab === 'products' && (
        <div className="space-y-8 animate-fade-in">
          {loadingTab ? (
            <Loader className="py-24" />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Product management List table */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="font-bold text-lg">Product Inventory</h2>
                  <button
                    onClick={openAddProduct}
                    className="btn-primary !py-2 !px-4 text-xs flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Product</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="py-3 px-2">Image</th>
                        <th className="py-3 px-2">Title</th>
                        <th className="py-3 px-2">Price</th>
                        <th className="py-3 px-2">Stock</th>
                        <th className="py-3 px-2">Category</th>
                        <th className="py-3 px-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                      {products.map((prod) => (
                        <tr key={prod._id} className="hover:bg-slate-50 dark:hover:bg-slate-850/30">
                          <td className="py-3.5 px-2">
                            <img
                              src={prod.images[0]}
                              alt={prod.title}
                              className="h-10 w-10 object-cover rounded-lg bg-slate-100 shrink-0"
                            />
                          </td>
                          <td className="py-3.5 px-2">
                            <p className="font-bold truncate max-w-[150px]" title={prod.title}>
                              {prod.title}
                            </p>
                            <span className="text-[10px] text-slate-400 block font-semibold">
                              Brand: {prod.brand}
                            </span>
                          </td>
                          <td className="py-3.5 px-2 font-bold">${prod.price.toFixed(2)}</td>
                          <td className="py-3.5 px-2">
                            <span
                              className={`text-xs font-bold ${
                                prod.stock === 0 ? 'text-red-500' : 'text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {prod.stock} items
                            </span>
                          </td>
                          <td className="py-3.5 px-2">
                            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                              {prod.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-2 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => openEditProduct(prod)}
                                className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition"
                                title="Edit Product"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod._id)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition"
                                title="Delete Product"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Category creation panel */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="font-bold text-lg border-b border-slate-100 dark:border-slate-800 pb-3">
                    Categories
                  </h2>
                </div>

                {/* Add Category Form */}
                <form onSubmit={handleCreateCategory} className="space-y-4">
                  <h3 className="text-sm font-bold">Create Category</h3>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-bold uppercase">Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sports"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-bold uppercase">Image Link</label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={newCatImage}
                      onChange={(e) => setNewCatImage(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingCat || !newCatName || !newCatImage}
                    className="btn-primary w-full !py-2 text-xs flex items-center justify-center gap-1"
                  >
                    {isSubmittingCat ? (
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>Add Category</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Categories List */}
                <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold mb-3">Existing Categories</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {categories.map((cat) => (
                      <div
                        key={cat._id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="h-8 w-8 object-cover rounded-lg bg-slate-100 shrink-0"
                          />
                          <span className="text-xs font-semibold">{cat.name}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteCategory(cat._id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 transition rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                          title="Delete Category"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. TAB VIEW: ORDERS MANAGEMENT */}
      {currentTab === 'orders' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 animate-fade-in">
          <h2 className="font-bold text-lg border-b border-slate-100 dark:border-slate-800 pb-3">
            All Placed Orders
          </h2>

          {loadingTab ? (
            <Loader className="py-24" />
          ) : orders.length === 0 ? (
            <div className="text-slate-400 py-12 text-center italic">No orders logged in database yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="py-3 px-2">Order ID</th>
                    <th className="py-3 px-2">Customer</th>
                    <th className="py-3 px-2">Date</th>
                    <th className="py-3 px-2">Total Amount</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                  {orders.map((ord) => (
                    <tr key={ord._id} className="hover:bg-slate-50 dark:hover:bg-slate-850/30">
                      <td className="py-3.5 px-2 font-semibold select-all text-xs">
                        {ord._id}
                      </td>
                      <td className="py-3.5 px-2">
                        <p className="font-bold">{ord.user?.name || 'Deleted Account'}</p>
                        <span className="text-[10px] text-slate-400 block font-medium">
                          {ord.user?.email || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-xs font-medium">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-2 font-bold">${ord.totalAmount.toFixed(2)}</td>
                      <td className="py-3.5 px-2">
                        <span
                          className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${
                            ord.orderStatus === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              : ord.orderStatus === 'Shipped'
                              ? 'bg-amber-50 text-amber-600 border-amber-100'
                              : ord.orderStatus === 'Cancelled'
                              ? 'bg-red-50 text-red-600 border-red-100'
                              : 'bg-blue-50 text-blue-600 border-blue-100'
                          }`}
                        >
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        {ord.orderStatus !== 'Cancelled' && ord.orderStatus !== 'Delivered' ? (
                          <select
                            value={ord.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold py-1 px-2.5 rounded-lg"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        ) : (
                          <span className="text-xs text-slate-400">Locked</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. TAB VIEW: USERS MANAGEMENT */}
      {currentTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 animate-fade-in">
          <h2 className="font-bold text-lg border-b border-slate-100 dark:border-slate-800 pb-3">
            Registered Users
          </h2>

          {loadingTab ? (
            <Loader className="py-24" />
          ) : users.length === 0 ? (
            <div className="text-slate-400 py-12 text-center italic">No registered user logs.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="py-3 px-2">Image</th>
                    <th className="py-3 px-2">Name</th>
                    <th className="py-3 px-2">Email</th>
                    <th className="py-3 px-2">Role</th>
                    <th className="py-3 px-2">Account State</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-850/30">
                      <td className="py-3.5 px-2">
                        <img
                          src={
                            u.profileImage ||
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80'
                          }
                          alt={u.name}
                          className="h-9 w-9 rounded-full object-cover border"
                        />
                      </td>
                      <td className="py-3.5 px-2 font-semibold">{u.name}</td>
                      <td className="py-3.5 px-2 font-medium">{u.email}</td>
                      <td className="py-3.5 px-2">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-650 dark:bg-purple-950/20'
                              : 'bg-slate-100 text-slate-650 dark:bg-slate-800/80'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-2">
                        {u.isBlocked ? (
                          <span className="text-xs text-red-500 font-bold">Blocked</span>
                        ) : (
                          <span className="text-xs text-emerald-500 font-bold">Active</span>
                        )}
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        {u.role !== 'admin' ? (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleToggleBlockUser(u._id)}
                              className={`p-2 rounded-lg transition ${
                                u.isBlocked
                                  ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                                  : 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20'
                              }`}
                              title={u.isBlocked ? 'Unblock User' : 'Block User'}
                            >
                              {u.isBlocked ? (
                                <Unlock className="h-4 w-4" />
                              ) : (
                                <Lock className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition"
                              title="Delete User"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">None</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 5. TAB VIEW: REVIEWS MANAGEMENT */}
      {currentTab === 'reviews' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 animate-fade-in">
          <h2 className="font-bold text-lg border-b border-slate-100 dark:border-slate-800 pb-3">
            Product Feedback Reviews
          </h2>

          {loadingTab ? (
            <Loader className="py-24" />
          ) : reviews.length === 0 ? (
            <div className="text-slate-400 py-12 text-center italic">No customer reviews in database.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="py-3 px-2">Product</th>
                    <th className="py-3 px-2">Author</th>
                    <th className="py-3 px-2">Rating</th>
                    <th className="py-3 px-2">Comment</th>
                    <th className="py-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                  {reviews.map((rev) => (
                    <tr key={rev._id} className="hover:bg-slate-50 dark:hover:bg-slate-850/30">
                      <td className="py-3.5 px-2">
                        <p className="font-bold truncate max-w-[150px]" title={rev.product?.title}>
                          {rev.product?.title || 'Deleted Product'}
                        </p>
                        <span className="text-[10px] text-slate-400 block font-semibold">
                          ID: {rev.product?._id || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 font-bold">{rev.userName}</td>
                      <td className="py-3.5 px-2">
                        <span className="inline-flex items-center gap-0.5 text-amber-500 font-bold">
                          {rev.rating} <Star className="h-3.5 w-3.5 fill-amber-500" />
                        </span>
                      </td>
                      <td className="py-3.5 px-2">
                        <p className="max-w-xs truncate text-xs" title={rev.comment}>
                          {rev.comment}
                        </p>
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <button
                          onClick={() => handleDeleteReview(rev._id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition"
                          title="Delete Review"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PRODUCT ADD/EDIT MODAL OVERLAY */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop mask */}
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setIsProductModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full z-10 shadow-2xl overflow-y-auto max-h-[85vh] animate-bounce-in">
            <h3 className="text-xl font-bold mb-6">
              {editingProduct ? 'Edit Product Specifications' : 'Add New Product'}
            </h3>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-bold uppercase">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Wireless Headset"
                  value={prodTitle}
                  onChange={(e) => setProdTitle(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-bold uppercase">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="299.99"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-bold uppercase">Stock Count</label>
                  <input
                    type="number"
                    placeholder="10"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-bold uppercase">Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="form-select"
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-bold uppercase">Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. Sony"
                    value={prodBrand}
                    onChange={(e) => setProdBrand(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-bold uppercase">Image Upload / URL</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="/uploads/file.jpg or Unsplash link"
                    value={prodImage}
                    onChange={(e) => setProdImage(e.target.value)}
                    className="form-input flex-grow"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProductImageUpload}
                    className="hidden"
                    id="product-image-file"
                  />
                  <label
                    htmlFor="product-image-file"
                    className="btn-secondary !py-2.5 !px-3 text-xs cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>{uploadingProdImage ? '...' : 'Upload'}</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-bold uppercase">Description</label>
                <textarea
                  rows="4"
                  placeholder="Enter detailed description specs..."
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="form-input resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="btn-secondary !py-2.5 !px-5 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProd || uploadingProdImage}
                  className="btn-primary !py-2.5 !px-5 text-sm flex items-center gap-1"
                >
                  {isSubmittingProd ? (
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Alert Banner */}
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

export default AdminDashboard;
