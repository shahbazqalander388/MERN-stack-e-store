import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { Heart, Star, ShoppingCart } from 'lucide-react';

const ProductCard = ({ product, onShowToast }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const navigate = useNavigate();

  const isWishlisted = isInWishlist(product._id);

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const success = await toggleWishlist(product._id);
    if (!success) {
      if (onShowToast) {
        onShowToast('Please log in to manage your wishlist', 'error');
      } else {
        navigate('/login');
      }
    } else {
      if (onShowToast) {
        onShowToast(
          isWishlisted ? 'Removed from wishlist' : 'Added to wishlist',
          'success'
        );
      }
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) {
      if (onShowToast) onShowToast('Product is out of stock', 'error');
      return;
    }
    addToCart(product, 1);
    if (onShowToast) {
      onShowToast(`Added ${product.title} to your cart`, 'success');
    }
  };

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      {/* Product Image Viewer */}
      <Link to={`/product/${product._id}`} className="block overflow-hidden relative pb-[100%] bg-slate-100 dark:bg-slate-900">
        <img
          src={product.images[0]}
          alt={product.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
          loading="lazy"
        />
        {/* Wishlist Heart Overlay */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-full shadow-sm text-slate-500 hover:text-red-500 hover:scale-110 active:scale-95 transition-all duration-200"
          title="Add to Wishlist"
        >
          <Heart
            className={`h-4.5 w-4.5 ${
              isWishlisted ? 'fill-red-500 text-red-500' : 'text-slate-600 dark:text-slate-300'
            }`}
          />
        </button>

        {/* Stock Badge Overlay */}
        {product.stock === 0 && (
          <span className="absolute bottom-3 left-3 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
            Out of Stock
          </span>
        )}
      </Link>

      {/* Product Details Section */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          {/* Brand & Category Label */}
          <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mb-1.5 font-semibold">
            <span>{product.brand}</span>
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-[10px]">
              {product.category}
            </span>
          </div>

          {/* Product Title */}
          <Link
            to={`/product/${product._id}`}
            className="block text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-primary-600 dark:hover:text-primary-400 transition line-clamp-2 mb-2 min-h-[40px]"
          >
            {product.title}
          </Link>

          {/* Rating Score */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.round(product.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200 dark:text-slate-800'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              ({product.numReviews})
            </span>
          </div>
        </div>

        {/* Price & Action Button */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100 dark:border-slate-800/60">
          <span className="text-base font-extrabold text-slate-900 dark:text-slate-50">
            ${product.price.toFixed(2)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="p-2 bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-500/80 rounded-xl transition duration-300 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400"
            title="Add to Cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
