import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Synchronize profile details when page is loaded
  useEffect(() => {
    const syncProfile = async () => {
      if (token) {
        try {
          const { data } = await api.get('/auth/profile');
          setUser(data);
        } catch (error) {
          console.error('Session sync failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    syncProfile();
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser({
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
      profileImage: data.profileImage,
      wishlist: data.wishlist || []
    });
    setToken(data.token);
    localStorage.setItem('token', data.token);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    setUser({
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
      profileImage: data.profileImage,
      wishlist: []
    });
    setToken(data.token);
    localStorage.setItem('token', data.token);
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const updateProfile = async (profileData) => {
    const { data } = await api.put('/auth/profile', profileData);
    setUser((prev) => ({
      ...prev,
      name: data.name,
      email: data.email,
      profileImage: data.profileImage
    }));
    return data;
  };

  const forgotPassword = async (email, newPassword) => {
    const { data } = await api.post('/auth/forgot-password', {
      email,
      newPassword
    });
    return data;
  };

  const syncWishlist = (updatedWishlist) => {
    setUser((prev) => (prev ? { ...prev, wishlist: updatedWishlist } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        forgotPassword,
        syncWishlist
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
