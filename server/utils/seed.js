import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';

dotenv.config();

const categoriesData = [
  {
    name: 'Electronics',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&q=80'
  },
  {
    name: 'Fashion',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&q=80'
  },
  {
    name: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&q=80'
  },
  {
    name: 'Books',
    image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500&q=80'
  },
  {
    name: 'Fitness',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&q=80'
  }
];

const productsData = [
  {
    title: 'Wireless Noise-Cancelling Headphones',
    description: 'Experience premium audio quality and industry-leading noise cancellation. Features up to 30 hours of battery life, touch sensor controls, and smart listening features.',
    category: 'Electronics',
    brand: 'Sony',
    price: 299.99,
    stock: 15,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'],
    rating: 4.8,
    numReviews: 12
  },
  {
    title: 'Mechanical Gaming Keyboard',
    description: 'Customizable RGB backlit keys with mechanical green switches. Fast response rates and tactile feedback, built for professional esports gaming.',
    category: 'Electronics',
    brand: 'Razer',
    price: 129.99,
    stock: 25,
    images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80'],
    rating: 4.5,
    numReviews: 8
  },
  {
    title: 'Premium Smart Watch Series 7',
    description: 'Track workouts, monitor health sensors, and stay connected on the go. Features an edge-to-edge always-on display and dust resistance.',
    category: 'Electronics',
    brand: 'Apple',
    price: 399.99,
    stock: 8,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'],
    rating: 4.7,
    numReviews: 19
  },
  {
    title: 'Classic Vintage Leather Jacket',
    description: 'Handcrafted from 100% genuine lambskin leather. Complete with double asymmetrical zippers, vintage hardware, and warm quilted interior lining.',
    category: 'Fashion',
    brand: 'Zara',
    price: 199.99,
    stock: 5,
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80'],
    rating: 4.4,
    numReviews: 5
  },
  {
    title: 'Premium Canvas Travel Backpack',
    description: 'Rugged canvas layout with leather strap buckles. Includes a padded 15-inch laptop compartment, water-resistant base, and dual side pockets.',
    category: 'Fashion',
    brand: 'Herschel',
    price: 79.99,
    stock: 30,
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80'],
    rating: 4.6,
    numReviews: 14
  },
  {
    title: 'Minimalist Chronograph Watch',
    description: 'Clean brushed gold casing with a genuine black leather strap. Precise Japanese quartz movement with discrete dual dial chronograph sub-faces.',
    category: 'Fashion',
    brand: 'MVMT',
    price: 149.99,
    stock: 12,
    images: ['https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80'],
    rating: 4.3,
    numReviews: 7
  },
  {
    title: 'Automatic Espresso Coffee Machine',
    description: 'Barista-quality espresso at home. Features an integrated conical burr grinder, 15-bar pump system, and automatic milk steam texturing wand.',
    category: 'Home & Kitchen',
    brand: 'Breville',
    price: 599.99,
    stock: 6,
    images: ['https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?w=800&q=80'],
    rating: 4.9,
    numReviews: 10
  },
  {
    title: 'Stainless Steel Cookware Set (10-Piece)',
    description: 'Triple-ply aluminum core cookware for professional heat distribution. Includes helper handles, tempered glass lids, and induction compatibility.',
    category: 'Home & Kitchen',
    brand: 'Cuisinart',
    price: 249.99,
    stock: 10,
    images: ['https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&q=80'],
    rating: 4.5,
    numReviews: 6
  },
  {
    title: 'The Adventure of Coding: Guidebook',
    description: 'A comprehensive journey into modern web structures, system logic, and API designs. Written for beginner and intermediate software developers.',
    category: 'Books',
    brand: 'TechPress',
    price: 19.99,
    stock: 50,
    images: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80'],
    rating: 4.8,
    numReviews: 22
  },
  {
    title: 'Adjustable Dumbbells Set (55 lbs)',
    description: 'Replaces 15 sets of weights in one space-saving design. Adjusts from 5 lbs up to 55 lbs with a simple dial turn. Includes durable safety trays.',
    category: 'Fitness',
    brand: 'Bowflex',
    price: 349.99,
    stock: 7,
    images: ['https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=800&q=80'],
    rating: 4.6,
    numReviews: 11
  }
];

const seedDatabase = async () => {
  try {
    // Connect DB
    await connectDB();

    console.log('Clearing old collections...');
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await Order.deleteMany();
    await Review.deleteMany();

    console.log('Seeding Categories...');
    await Category.insertMany(categoriesData);

    console.log('Seeding Products...');
    const seededProducts = await Product.insertMany(productsData);

    console.log('Seeding Default Users...');
    // Seeding requested Admin Account
    const adminUser = new User({
      name: 'Shahbaz Admin',
      email: 'syedshahbaz2004@gmail.com',
      password: 'khan123@@',
      role: 'admin',
      profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80'
    });
    await adminUser.save();

    // Seeding sample customer
    const customerUser = new User({
      name: 'Test Customer',
      email: 'customer@gmail.com',
      password: 'password123',
      role: 'user',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80'
    });
    const seededCustomer = await customerUser.save();

    console.log('Seeding Mock Reviews...');
    const randomProduct = seededProducts[0];
    const review = await Review.create({
      user: seededCustomer._id,
      userName: seededCustomer.name,
      product: randomProduct._id,
      rating: 5,
      comment: 'Absolutely amazing headphones! Active noise cancellation works perfectly and battery life is stellar.'
    });

    // Update product stats
    randomProduct.numReviews = 1;
    randomProduct.rating = 5.0;
    await randomProduct.save();

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
