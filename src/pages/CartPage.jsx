import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  const shippingCost = cartTotal > 150 ? 0 : 15;
  const grandTotal = cartTotal + shippingCost;

  const handleCheckoutClick = () => {
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-lg mx-auto shadow-sm space-y-5">
          <ShoppingBag className="h-16 w-16 text-slate-350 mx-auto animate-pulse" />
          <h2 className="text-xl font-bold">Your cart is empty</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Looks like you haven't added any products to your cart yet. Head
            back to the shop to find great selections.
          </p>
          <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Go to Shop</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart items list */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.product}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between transition hover:shadow-md"
              >
                {/* Image & Title details */}
                <div className="flex gap-4 items-center w-full sm:w-auto">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <Link
                      to={`/product/${item.product}`}
                      className="text-sm font-bold text-slate-900 dark:text-slate-50 hover:text-primary-600 line-clamp-1"
                    >
                      {item.title}
                    </Link>
                    <p className="text-xs text-slate-450 font-semibold uppercase tracking-wider">
                      Price: ${item.price.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Controls & Math */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  {/* Quantity adjust */}
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => updateQuantity(item.product, item.quantity - 1)}
                      className="h-7 w-7 flex items-center justify-center font-bold text-sm hover:bg-white dark:hover:bg-slate-700 rounded-lg transition"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product, item.quantity + 1)}
                      className="h-7 w-7 flex items-center justify-center font-bold text-sm hover:bg-white dark:hover:bg-slate-700 rounded-lg transition"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right min-w-[70px]">
                    <span className="text-sm font-extrabold text-slate-900 dark:text-slate-50">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => removeFromCart(item.product)}
                    className="p-2 bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition duration-300"
                    title="Remove item"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart totals summary */}
          <aside className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-lg border-b border-slate-100 dark:border-slate-800 pb-3">
              Order Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  ${cartTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Shipping Cost</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              {shippingCost > 0 && (
                <p className="text-[10px] text-slate-400 italic">
                  Spend over $150.00 to qualify for Free Shipping.
                </p>
              )}
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            <div className="flex justify-between font-extrabold text-base">
              <span>Grand Total</span>
              <span className="text-slate-950 dark:text-white">${grandTotal.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="w-full btn-primary text-sm flex items-center justify-center gap-2 py-3"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </aside>
        </div>
      )}
    </div>
  );
};

export default CartPage;
