import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import Loader from '../components/Loader.jsx';
import Toast from '../components/Toast.jsx';
import { Star, ShoppingBag, Heart, MessageSquare, ChevronRight, User } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { user } = useAuth();

  // Page States
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState(null);

  // Review Form States
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const isWishlisted = product ? isInWishlist(product._id) : false;

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/products/${id}`);
      setProduct(data.product);
      setReviews(data.reviews);
    } catch (err) {
      console.error('Failed to load product details:', err);
      setToast({ message: 'Product not found or database offline', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
    setQuantity(1);
  }, [id]);

  const handleQtyChange = (type) => {
    if (type === 'inc') {
      setQuantity((prev) => Math.min(product.stock, prev + 1));
    } else {
      setQuantity((prev) => Math.max(1, prev - 1));
    }
  };

  const handleAddToCart = () => {
    if (product.stock === 0) {
      setToast({ message: 'Product is currently out of stock', type: 'error' });
      return;
    }
    addToCart(product, quantity);
    setToast({
      message: `Added ${quantity} ${quantity > 1 ? 'items' : 'item'} to your cart`,
      type: 'success'
    });
  };

  const handleWishlistToggle = async () => {
    const success = await toggleWishlist(product._id);
    if (!success) {
      setToast({ message: 'Please log in to add to wishlist', type: 'error' });
      // Delay redirect slightly so toast is visible
      setTimeout(() => navigate('/login'), 1500);
    } else {
      setToast({
        message: isWishlisted ? 'Removed from wishlist' : 'Added to wishlist',
        type: 'success'
      });
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setToast({ message: 'Please write a comment', type: 'error' });
      return;
    }

    try {
      setSubmittingReview(true);
      await api.post(`/products/${id}/reviews`, { rating, comment });
      setToast({ message: 'Review submitted successfully!', type: 'success' });
      setComment('');
      setRating(5);
      // Re-fetch product details to sync the reviews list and new average rating
      await fetchProductDetails();
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Failed to submit review',
        type: 'error'
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <Loader className="min-h-[70vh]" />;
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-400 mb-4 font-semibold">Failed to find requested product</p>
        <Link to="/shop" className="btn-primary">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb Navigation links */}
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
        <Link to="/" className="hover:text-primary-600 transition">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/shop" className="hover:text-primary-600 transition">Shop</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-900 dark:text-slate-50 truncate max-w-[200px]">{product.title}</span>
      </div>

      {/* Main product specs section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Product Image Viewer */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden p-6 shadow-sm flex items-center justify-center">
          <img
            src={product.images[0]}
            alt={product.title}
            className="max-h-[500px] object-contain w-full rounded-2xl hover:scale-102 transition duration-500"
          />
        </div>

        {/* Product Spec details */}
        <div className="space-y-6">
          <div className="space-y-2">
            {/* Brand and category labels */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-450 dark:text-slate-550 uppercase tracking-wider">
              <span>{product.brand}</span>
              <span className="h-3.5 w-[1px] bg-slate-200 dark:bg-slate-800" />
              <span>{product.category}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
              {product.title}
            </h1>

            {/* Stars & rating score */}
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4.5 w-4.5 ${
                      i < Math.round(product.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200 dark:text-slate-800'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-slate-500">
                {product.rating.toFixed(1)} Rating ({product.numReviews} customer reviews)
              </span>
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Pricing detail */}
          <div className="flex items-baseline gap-4">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-50">
              ${product.price.toFixed(2)}
            </span>
            {/* Stock indicator */}
            {product.stock > 0 ? (
              <span className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-md border border-emerald-100 dark:border-emerald-900/30">
                In Stock ({product.stock} items left)
              </span>
            ) : (
              <span className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-bold px-2.5 py-1 rounded-md border border-red-100 dark:border-red-900/30">
                Out of Stock
              </span>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2 text-sm leading-relaxed text-slate-650 dark:text-slate-400">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Product Description</h3>
            <p>{product.description}</p>
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Cart Quantity adjust and buttons */}
          {product.stock > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Quantity:</span>
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden p-1 border border-slate-200 dark:border-slate-700/50">
                  <button
                    onClick={() => handleQtyChange('dec')}
                    className="h-8 w-8 flex items-center justify-center font-bold text-lg hover:bg-white dark:hover:bg-slate-700 rounded-lg transition"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-sm font-bold">{quantity}</span>
                  <button
                    onClick={() => handleQtyChange('inc')}
                    className="h-8 w-8 flex items-center justify-center font-bold text-lg hover:bg-white dark:hover:bg-slate-700 rounded-lg transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleAddToCart}
                  className="btn-primary !px-8 text-sm flex items-center gap-2"
                >
                  <ShoppingBag className="h-4.5 w-4.5" />
                  <span>Add to Shopping Cart</span>
                </button>

                <button
                  onClick={handleWishlistToggle}
                  className={`flex items-center justify-center p-3 border rounded-xl hover:scale-103 active:scale-97 transition ${
                    isWishlisted
                      ? 'bg-red-50 dark:bg-red-950/20 border-red-200 text-red-500'
                      : 'border-slate-200 dark:border-slate-700 dark:hover:bg-slate-800 text-slate-500'
                  }`}
                  title="Wishlist toggle"
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Reviews & Ratings Section */}
      <section className="border-t border-slate-200 dark:border-slate-800 pt-10">
        <h2 className="text-2xl font-bold tracking-tight mb-8">Customer Reviews ({reviews.length})</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Reviews list panel */}
          <div className="lg:col-span-2 space-y-6">
            {reviews.length === 0 ? (
              <div className="text-slate-400 italic p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                No reviews yet for this product. Be the first to review it!
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{rev.userName}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">
                            {new Date(rev.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Review stars */}
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < rev.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200 dark:text-slate-800'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Review text */}
                    <p className="text-sm text-slate-650 dark:text-slate-400 leading-relaxed pl-10">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Review form card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-lg">Write a Review</h3>

            {user ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Rating Score
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition font-semibold"
                  >
                    <option value="5">5 Stars (Excellent)</option>
                    <option value="4">4 Stars (Very Good)</option>
                    <option value="3">3 Stars (Good)</option>
                    <option value="2">2 Stars (Fair)</option>
                    <option value="1">1 Star (Poor)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Commentary
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Write details about the build, performance, styling, or shipping..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full btn-primary text-sm flex items-center justify-center gap-2"
                >
                  {submittingReview ? (
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <MessageSquare className="h-4.5 w-4.5" />
                      <span>Submit Review</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-450 mb-3">
                  Please log in to submit a product review.
                </p>
                <Link to="/login" className="btn-secondary !py-2 !px-4 text-xs inline-block">
                  Log In Now
                </Link>
              </div>
            )}
          </div>
        </div>
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

export default ProductDetails;
