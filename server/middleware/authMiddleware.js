import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'super_secret_key_123_estore_project'
      );

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        res.status(401);
        return next(new Error('Not authorized, user not found'));
      }

      if (user.isBlocked) {
        res.status(403);
        return next(new Error('Your account has been blocked by the admin'));
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Auth verification error:', error);
      res.status(401);
      return next(new Error('Not authorized, token validation failed'));
    }
  } else {
    res.status(401);
    return next(new Error('Not authorized, no token provided'));
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    return next(new Error('Not authorized, admin rights required'));
  }
};
