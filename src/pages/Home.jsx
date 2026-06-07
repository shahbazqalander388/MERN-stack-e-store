import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import Loader from '../components/Loader.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Toast from '../components/Toast.jsx';
import { ArrowRight, ShieldCheck, Truck, RotateCcw, Heart } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products?limit=4&sortBy=rating')
        ]);
        setCategories(categoriesRes.data);
        setFeaturedProducts(productsRes.data.products);
      } catch (error) {
        console.error('Error loading homepage data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleShowToast = (message, type) => {
    setToast({ message, type });
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Premium Hero Banner */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-24 sm:py-32">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl text-left space-y-6">
            <span className="bg-primary-500/10 text-primary-400 font-bold uppercase tracking-wider text-xs px-3.5 py-1.5 rounded-full border border-primary-500/20">
              Introducing E-Store Premium
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
              Elevate Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400">
                Daily Lifestyle
              </span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-lg leading-relaxed">
              Explore our hand-selected products crafted for modern aesthetics and visual elegance. From premium audio gears to sleek personal fashion.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/shop" className="btn-primary !px-8 text-sm flex items-center gap-2">
                <span>Explore Store</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>
              <Link to="/shop?category=Electronics" className="btn-secondary !bg-transparent !text-white hover:!bg-white/10 !border-white/20 !px-8 text-sm">
                Shop Electronics
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <Truck className="h-10 w-10 text-primary-550 shrink-0" />
            <div>
              <h3 className="font-bold text-base mb-1">Worldwide Shipping</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Quick shipping straight to your address with end-to-end tracking.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <ShieldCheck className="h-10 w-10 text-primary-550 shrink-0" />
            <div>
              <h3 className="font-bold text-base mb-1">Secure Payments</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your credentials are encrypted and stored using standard token hashes.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <RotateCcw className="h-10 w-10 text-primary-550 shrink-0" />
            <div>
              <h3 className="font-bold text-base mb-1">Easy Exchanges</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Not satisfied with your order? Initiate standard returns within 14 days.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Banner Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Curated Categories</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Filter products by your favorite category departments
            </p>
          </div>
        </div>

        {loading ? (
          <Loader className="py-12" />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {categories.map((cat) => (
              <div
                key={cat._id}
                onClick={() => navigate(`/shop?category=${encodeURIComponent(cat.name)}`)}
                className="group cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition duration-300 text-center p-4 flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden mb-3 bg-slate-100 dark:bg-slate-800">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {cat.name}
                </h3>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Top Rated / Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Featured Products</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Top rated selections from our design inventory
            </p>
          </div>
          <Link
            to="/shop"
            className="flex items-center gap-1 text-sm font-bold text-primary-600 dark:text-primary-400 hover:underline"
          >
            <span>View All</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <Loader className="py-12" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((prod) => (
              <ProductCard
                key={prod._id}
                product={prod}
                onShowToast={handleShowToast}
              />
            ))}
          </div>
        )}
      </section>

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

export default Home;
