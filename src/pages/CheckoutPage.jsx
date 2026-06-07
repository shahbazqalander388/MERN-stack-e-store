import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import api from '../services/api.js';
import Toast from '../components/Toast.jsx';
import { CreditCard, Truck, ArrowLeft, ShieldCheck } from 'lucide-react';

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const shippingCost = cartTotal > 150 ? 0 : 15;
  const grandTotal = cartTotal + shippingCost;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!address || !city || !postalCode || !country) {
      setToast({ message: 'Please enter all address details', type: 'error' });
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        orderItems: cartItems.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: {
          address,
          city,
          postalCode,
          country
        },
        totalAmount: grandTotal
      };

      await api.post('/orders', orderData);
      setToast({ message: 'Order placed successfully!', type: 'success' });
      clearCart();

      // Delay redirect to dashboard to allow toast to render
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Checkout failed:', err);
      setToast({
        message: err.response?.data?.message || 'Failed to place order. Try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Cart</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Checkout Shipping Form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="h-6 w-6 text-primary-550" />
            <h2 className="text-xl font-bold">Shipping Address</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Street Address
              </label>
              <input
                type="text"
                placeholder="123 Luxury Avenue"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  City
                </label>
                <input
                  type="text"
                  placeholder="New York"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Postal / ZIP Code
                </label>
                <input
                  type="text"
                  placeholder="10001"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  placeholder="United States"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                  required
                />
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800 my-6" />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary-550" />
                <h3 className="font-bold text-base">Payment Method</h3>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-2xl flex items-center gap-3">
                <input
                  type="radio"
                  defaultChecked
                  className="h-4.5 w-4.5 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <p className="text-sm font-semibold">Credit/Debit Card (Simulated)</p>
                  <p className="text-xs text-slate-400">
                    Instant secure transaction payment simulation.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-sm py-3 mt-8 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5" />
                  <span>Confirm and Place Order</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Sidebar Order Summary */}
        <aside className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-lg border-b border-slate-100 dark:border-slate-800 pb-3">
            Review Items
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={item.product} className="py-3 flex gap-3 items-center">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-12 w-12 object-cover rounded-lg bg-slate-100 shrink-0"
                />
                <div className="min-w-0 flex-grow">
                  <p className="text-xs font-bold line-clamp-1">{item.title}</p>
                  <p className="text-[10px] text-slate-400">
                    Qty: {item.quantity} &times; ${item.price.toFixed(2)}
                  </p>
                </div>
                <span className="text-xs font-bold shrink-0">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          <div className="space-y-2.5 text-xs font-semibold">
            <div className="flex justify-between text-slate-400">
              <span>Items Subtotal</span>
              <span className="text-slate-800 dark:text-slate-100">${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Shipping cost</span>
              <span className="text-slate-800 dark:text-slate-100">
                {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
              </span>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          <div className="flex justify-between font-extrabold text-sm uppercase">
            <span>Total Payable</span>
            <span className="text-primary-600 dark:text-primary-400">${grandTotal.toFixed(2)}</span>
          </div>
        </aside>
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

export default CheckoutPage;
