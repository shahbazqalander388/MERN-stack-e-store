import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext.jsx';
import api from '../services/api.js';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, syncWishlist } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    const localCart = localStorage.getItem('cart');
    return localCart ? JSON.parse(localCart) : [];
  });

  // Save cart modifications to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existItem = prevItems.find((x) => x.product === product._id);
      if (existItem) {
        const newQty = Math.min(product.stock, existItem.quantity + quantity);
        return prevItems.map((x) =>
          x.product === product._id ? { ...x, quantity: newQty } : x
        );
      } else {
        return [
          ...prevItems,
          {
            product: product._id,
            title: product.title,
            price: product.price,
            image: product.images[0],
            stock: product.stock,
            quantity: Math.min(product.stock, quantity)
          }
        ];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((x) => x.product !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    setCartItems((prevItems) =>
      prevItems.map((x) =>
        x.product === productId
          ? { ...x, quantity: Math.min(x.stock, Math.max(1, quantity)) }
          : x
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const handleToggleWishlist = async (productId) => {
    if (!user) {
      return false; // Tells frontend user must be logged in
    }
    try {
      const { data } = await api.post('/users/wishlist', { productId });
      syncWishlist(data);
      return true;
    } catch (error) {
      console.error('Failed to sync wishlist changes:', error);
      return false;
    }
  };

  const isInWishlist = (productId) => {
    if (!user || !user.wishlist) return false;
    return user.wishlist.some((item) => {
      const id = typeof item === 'object' ? item._id : item;
      return id.toString() === productId;
    });
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist: handleToggleWishlist,
        isInWishlist,
        cartCount,
        cartTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
