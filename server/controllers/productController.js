import Product from '../models/Product.js';
import Review from '../models/Review.js';

// @desc    Fetch all products with filters & pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const pageSize = Number(req.query.limit) || 8;
    const page = Number(req.query.page) || 1;

    const query = {};

    // Search filter
    if (req.query.keyword) {
      query.title = {
        $regex: req.query.keyword,
        $options: 'i'
      };
    }

    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Brand filter
    if (req.query.brand) {
      query.brand = req.query.brand;
    }

    // Price range filters
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) {
        query.price.$gte = Number(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        query.price.$lte = Number(req.query.maxPrice);
      }
    }

    // Rating filters
    if (req.query.rating) {
      query.rating = { $gte: Number(req.query.rating) };
    }

    const count = await Product.countDocuments(query);

    // Sort order
    let sort = { createdAt: -1 };
    if (req.query.sortBy) {
      if (req.query.sortBy === 'priceAsc') {
        sort = { price: 1 };
      } else if (req.query.sortBy === 'priceDesc') {
        sort = { price: -1 };
      } else if (req.query.sortBy === 'rating') {
        sort = { rating: -1 };
      }
    }

    const products = await Product.find(query)
      .sort(sort)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    // Get unique brands for filters
    const brands = await Product.distinct('brand');

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
      brands
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Find reviews for this product
      const reviews = await Review.find({ product: req.params.id }).sort({
        createdAt: -1
      });
      res.json({ product, reviews });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res, next) => {
  try {
    const { title, price, description, image, category, brand, stock } =
      req.body;

    const product = new Product({
      title: title || 'Sample Title',
      price: price || 0,
      description: description || 'Sample Description',
      images: image ? [image] : ['/images/sample.jpg'],
      category: category || 'Electronics',
      brand: brand || 'Sample Brand',
      stock: stock || 0,
      rating: 0,
      numReviews: 0
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res, next) => {
  try {
    const { title, price, description, images, category, brand, stock } =
      req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.title = title || product.title;
      product.price = price !== undefined ? price : product.price;
      product.description = description || product.description;
      product.images = images || product.images;
      product.category = category || product.category;
      product.brand = brand || product.brand;
      product.stock = stock !== undefined ? stock : product.stock;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Remove all associated reviews
      await Review.deleteMany({ product: req.params.id });
      await Product.findByIdAndDelete(req.params.id);
      res.json({ message: 'Product and associated reviews deleted' });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      res.status(400);
      throw new Error('Please provide a rating and a comment');
    }

    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = await Review.findOne({
        user: req.user._id,
        product: req.params.id
      });

      if (alreadyReviewed) {
        res.status(400);
        throw new Error('You have already reviewed this product');
      }

      const review = await Review.create({
        user: req.user._id,
        userName: req.user.name,
        product: req.params.id,
        rating: Number(rating),
        comment
      });

      // Update product rating stats
      const productReviews = await Review.find({ product: req.params.id });
      product.numReviews = productReviews.length;
      product.rating =
        productReviews.reduce((acc, item) => item.rating + acc, 0) /
        productReviews.length;

      await product.save();
      res.status(201).json({ message: 'Review added successfully', review });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews (Admin view)
// @route   GET /api/products/reviews/all
// @access  Private/Admin
export const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({}).populate(
      'product',
      'title price'
    );
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review
// @route   DELETE /api/products/reviews/:id
// @access  Private/Admin
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (review) {
      const productId = review.product;
      await Review.findByIdAndDelete(req.params.id);

      // Re-calculate product rating
      const product = await Product.findById(productId);
      if (product) {
        const productReviews = await Review.find({ product: productId });
        product.numReviews = productReviews.length;
        product.rating =
          productReviews.length > 0
            ? productReviews.reduce((acc, item) => item.rating + acc, 0) /
              productReviews.length
            : 0;
        await product.save();
      }

      res.json({ message: 'Review deleted successfully' });
    } else {
      res.status(404);
      throw new Error('Review not found');
    }
  } catch (error) {
    next(error);
  }
};
