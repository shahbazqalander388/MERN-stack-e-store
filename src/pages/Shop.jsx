import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api.js';
import Loader from '../components/Loader.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Toast from '../components/Toast.jsx';
import { SlidersHorizontal, ArrowUpDown, RefreshCw, X } from 'lucide-react';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // API State
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [toast, setToast] = useState(null);

  // Filters State (mirrored from URL query parameters)
  const categoryFilter = searchParams.get('category') || '';
  const brandFilter = searchParams.get('brand') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const ratingFilter = searchParams.get('rating') || '';
  const sortBy = searchParams.get('sortBy') || 'newest';
  const keyword = searchParams.get('keyword') || '';

  // Local filter states for inputs
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Sync inputs with URL change
  useEffect(() => {
    setLocalMinPrice(minPrice);
    setLocalMaxPrice(maxPrice);
  }, [minPrice, maxPrice]);

  // Fetch filters list on mount
  useEffect(() => {
    const fetchFilterMeta = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchFilterMeta();
  }, []);

  // Fetch products on parameter changes
  useEffect(() => {
    const fetchProductsData = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams(searchParams);
        // Ensure page is set
        if (!queryParams.has('page')) queryParams.set('page', page.toString());

        const { data } = await api.get(`/products?${queryParams.toString()}`);
        setProducts(data.products);
        setPages(data.pages);
        setBrands(data.brands || []);
      } catch (err) {
        console.error('Failed to load products:', err);
        setToast({ message: 'Error loading products', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchProductsData();
  }, [searchParams, page]);

  const updateURLParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Reset page on filter changes
    newParams.set('page', '1');
    setPage(1);
    setSearchParams(newParams);
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (localMinPrice) newParams.set('minPrice', localMinPrice);
    else newParams.delete('minPrice');

    if (localMaxPrice) newParams.set('maxPrice', localMaxPrice);
    else newParams.delete('maxPrice');

    newParams.set('page', '1');
    setPage(1);
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
    setPage(1);
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setIsMobileFiltersOpen(false);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pages) {
      setPage(newPage);
      const newParams = new URLSearchParams(searchParams);
      newParams.set('page', newPage.toString());
      setSearchParams(newParams);
    }
  };

  const handleShowToast = (message, type) => {
    setToast({ message, type });
  };

  const filtersContent = (
    <div className="space-y-6">
      {/* Category filters */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Category
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => updateURLParam('category', '')}
            className={`w-full text-left text-sm py-1.5 px-3 rounded-lg transition ${
              categoryFilter === ''
                ? 'bg-primary-50 text-primary-600 font-bold dark:bg-primary-950/20'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => updateURLParam('category', cat.name)}
              className={`w-full text-left text-sm py-1.5 px-3 rounded-lg transition ${
                categoryFilter === cat.name
                  ? 'bg-primary-50 text-primary-600 font-bold dark:bg-primary-950/20'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-800" />

      {/* Brand Filters */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Brand
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => updateURLParam('brand', '')}
            className={`w-full text-left text-sm py-1.5 px-3 rounded-lg transition ${
              brandFilter === ''
                ? 'bg-primary-50 text-primary-600 font-bold dark:bg-primary-950/20'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Brands
          </button>
          {brands.map((b) => (
            <button
              key={b}
              onClick={() => updateURLParam('brand', b)}
              className={`w-full text-left text-sm py-1.5 px-3 rounded-lg transition ${
                brandFilter === b
                  ? 'bg-primary-50 text-primary-600 font-bold dark:bg-primary-950/20'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-800" />

      {/* Price Filters */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Price Range ($)
        </h3>
        <form onSubmit={handlePriceApply} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={localMinPrice}
              onChange={(e) => setLocalMinPrice(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-3 text-xs"
            />
            <input
              type="number"
              placeholder="Max"
              value={localMaxPrice}
              onChange={(e) => setLocalMaxPrice(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-3 text-xs"
            />
          </div>
          <button
            type="submit"
            className="w-full btn-secondary !py-1.5 !px-3 text-xs text-center block"
          >
            Apply Price
          </button>
        </form>
      </div>

      <hr className="border-slate-200 dark:border-slate-800" />

      {/* Rating Filters */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Minimum Rating
        </h3>
        <div className="space-y-1">
          {[4, 3, 2, 1].map((r) => (
            <button
              key={r}
              onClick={() => updateURLParam('rating', r.toString())}
              className={`w-full text-left text-sm py-1.5 px-3 rounded-lg transition ${
                ratingFilter === r.toString()
                  ? 'bg-primary-50 text-primary-600 font-bold dark:bg-primary-950/20'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {r} Stars & Up
            </button>
          ))}
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-800" />

      {/* Reset filters button */}
      <button
        onClick={handleClearFilters}
        className="w-full flex items-center justify-center gap-2 border border-dashed border-slate-300 dark:border-slate-700 hover:border-red-500 hover:text-red-500 py-2.5 px-4 rounded-xl text-sm transition"
      >
        <RefreshCw className="h-4 w-4" />
        <span>Reset All Filters</span>
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Result header info */}
      {keyword && (
        <div className="mb-6 bg-primary-50 dark:bg-slate-900 border border-primary-100 dark:border-slate-800 rounded-xl p-4 flex justify-between items-center">
          <p className="text-sm font-semibold">
            Showing results for "<span className="text-primary-600">{keyword}</span>"
          </p>
          <button
            onClick={() => updateURLParam('keyword', '')}
            className="text-slate-400 hover:text-red-500"
          >
            Clear Search
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Desktop Sidebar Filters panel */}
        <aside className="hidden lg:block w-64 shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm sticky top-24">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Filters</h2>
            <SlidersHorizontal className="h-5 w-5 text-slate-400" />
          </div>
          {filtersContent}
        </aside>

        {/* Content and Grid Area */}
        <div className="flex-grow w-full space-y-6">
          {/* Top toolbar */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 text-sm font-bold border border-slate-200 dark:border-slate-700 py-2 px-4 rounded-xl hover:bg-slate-50"
            >
              <SlidersHorizontal className="h-4.5 w-4.5" />
              <span>Filters</span>
            </button>

            <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
              Found {products.length} products
            </span>

            {/* Sorting trigger */}
            <div className="flex items-center gap-2 ml-auto">
              <ArrowUpDown className="h-4 w-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => updateURLParam('sortBy', e.target.value)}
                className="bg-transparent text-sm font-semibold py-1 focus:outline-none cursor-pointer"
              >
                <option value="newest" className="dark:bg-slate-900">Newest Arrivals</option>
                <option value="priceAsc" className="dark:bg-slate-900">Price: Low to High</option>
                <option value="priceDesc" className="dark:bg-slate-900">Price: High to Low</option>
                <option value="rating" className="dark:bg-slate-900">Avg. Customer Rating</option>
              </select>
            </div>
          </div>

          {/* Listing Grid */}
          {loading ? (
            <Loader className="py-24" />
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
              <p className="text-slate-400 mb-4 font-medium">No products match your filter search criteria.</p>
              <button onClick={handleClearFilters} className="btn-primary">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((prod) => (
                <ProductCard
                  key={prod._id}
                  product={prod}
                  onShowToast={handleShowToast}
                />
              ))}
            </div>
          )}

          {/* Pagination controls */}
          {pages > 1 && !loading && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="btn-secondary !py-2 !px-4 disabled:opacity-30 text-sm"
              >
                Previous
              </button>
              {[...Array(pages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`h-10 w-10 font-bold rounded-xl text-sm transition ${
                    page === i + 1
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-850 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === pages}
                className="btn-secondary !py-2 !px-4 disabled:opacity-30 text-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Filter Dialog */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop mask */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsMobileFiltersOpen(false)}
          />

          {/* Panel slide container */}
          <div className="relative w-full max-w-xs bg-white dark:bg-slate-900 h-full p-6 flex flex-col overflow-y-auto z-10 animate-slide-left ml-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg">Filters</h2>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {filtersContent}
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

export default Shop;
