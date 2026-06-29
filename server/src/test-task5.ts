import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config();

// Import models
import Category from './models/Category';
import Product from './models/Product';
import { deleteCategory } from './controllers/admin.controller';

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopee-at-home';
  console.log('Connecting to:', uri);
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  // Clean old test data
  await Product.deleteMany({ name: 'Task5 Test Product' });
  await Category.deleteMany({ name: { $in: ['CatToDelete1', 'CatToDelete2'] } });

  // Create two categories
  const cat1 = new Category({ name: 'CatToDelete1', image: 'test.jpg' });
  await cat1.save();

  const cat2 = new Category({ name: 'CatToDelete2', image: 'test.jpg' });
  await cat2.save();

  // Create a product in cat1
  const product = new Product({
    name: 'Task5 Test Product',
    price: 50000,
    quantity: 10,
    image: 'test.jpg',
    category: cat1._id,
    status: 'active'
  });
  await product.save();

  // Helper to create mock Express response
  const makeRes = () => ({
    statusCode: 200,
    bodyData: null as any,
    status: function(code: number) { this.statusCode = code; return this; },
    json: function(data: any) { this.bodyData = data; return this; }
  } as any);

  // 1. Try to delete cat1 (should fail because product exists)
  const req1 = { params: { id: cat1._id.toString() } } as any;
  const res1 = makeRes();
  await deleteCategory(req1, res1);
  console.log('Delete category with product response:', res1.statusCode);
  if (res1.statusCode !== 400) {
    throw new Error(`Expected deletion to fail with 400, got ${res1.statusCode}`);
  }

  // 2. Try to delete cat2 (should succeed because no products exist)
  const req2 = { params: { id: cat2._id.toString() } } as any;
  const res2 = makeRes();
  await deleteCategory(req2, res2);
  console.log('Delete category without product response:', res2.statusCode);
  if (res2.statusCode !== 200) {
    throw new Error(`Expected deletion to succeed with 200, got ${res2.statusCode}`);
  }

  // Clean up
  await Product.deleteMany({ _id: product._id });
  await Category.deleteMany({ _id: { $in: [cat1._id, cat2._id] } });

  console.log('All Task 5 tests passed successfully!');
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error('Test failed:', err);
  await mongoose.disconnect();
  process.exit(1);
});
