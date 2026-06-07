import User from '../models/User.js';

// @desc    Get all users (Admin view)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (user.role === 'admin') {
        res.status(400);
        throw new Error('Cannot delete admin accounts');
      }
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Block or Unblock a user
// @route   PUT /api/users/:id/block
// @access  Private/Admin
export const toggleUserBlock = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (user.role === 'admin') {
        res.status(400);
        throw new Error('Cannot block admin accounts');
      }

      user.isBlocked = !user.isBlocked;
      await user.save();

      res.json({
        message: `User has been successfully ${
          user.isBlocked ? 'blocked' : 'unblocked'
        }`,
        user
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Add or remove product in user wishlist
// @route   POST /api/users/wishlist
// @access  Private
export const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      res.status(400);
      throw new Error('Product ID is required');
    }

    const user = await User.findById(req.user._id);

    if (user) {
      const isWishlisted = user.wishlist.includes(productId);

      if (isWishlisted) {
        // Remove
        user.wishlist = user.wishlist.filter(
          (id) => id.toString() !== productId
        );
      } else {
        // Add
        user.wishlist.push(productId);
      }

      await user.save();
      const updatedUser = await User.findById(req.user._id).populate(
        'wishlist'
      );
      res.json(updatedUser.wishlist);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};
