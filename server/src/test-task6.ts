import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config();

// Import models
import Product from './models/Product';
import User from './models/User';
import { createStoreProduct, updateStoreProduct } from './controllers/store.controller';

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopee-at-home';
  console.log('Connecting to:', uri);
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  // Clean old test data
  await Product.deleteMany({ name: 'Task6 Test Product' });
  await User.deleteMany({ email: 'seller6@test.com' });

  // Create seller
  const seller = new User({ email: 'seller6@test.com', password: 'pwd', name: 'Seller 6', roles: ['User', 'Store'] });
  await seller.save();

  // Helper to create mock Express response
  const makeRes = () => ({
    statusCode: 200,
    bodyData: null as any,
    status: function(code: number) { this.statusCode = code; return this; },
    json: function(data: any) { this.bodyData = data; return this; }
  } as any);

  // Test Case 1: Try to create product with mass-assigned sold, view, rating, seller
  const fakeSellerId = new mongoose.Types.ObjectId();
  const req1 = {
    body: {
      name: 'Task6 Test Product',
      price: 150000,
      image: 'img.jpg',
      category: new mongoose.Types.ObjectId(),
      sold: 9999, // Should be ignored/set to 0
      view: 8888, // Should be ignored/set to 0
      rating: 5,   // Should be ignored/set to 0
      seller: fakeSellerId // Should be ignored/set to logged-in user ID
    },
    user: seller
  } as any;
  const res1 = makeRes();
  await createStoreProduct(req1, res1);
  console.log('Create product status:', res1.statusCode);

  const createdProductId = res1.bodyData.data._id;
  const dbProduct1 = await Product.findById(createdProductId);
  if (!dbProduct1) throw new Error('Product not created');
  
  console.log('Created product sold:', dbProduct1.sold);
  console.log('Created product view:', dbProduct1.view);
  console.log('Created product rating:', dbProduct1.rating);
  console.log('Created product seller:', dbProduct1.seller?.toString());

  if (dbProduct1.sold !== 0 || dbProduct1.view !== 0 || dbProduct1.rating !== 0) {
    throw new Error('Mass assignment protection failed on creation: sold, view or rating was assigned!');
  }
  if (dbProduct1.seller?.toString() !== seller._id.toString()) {
    throw new Error('Mass assignment protection failed on creation: seller ID was tampered!');
  }

  // Test Case 2: Try to update product with mass-assigned sold, view, rating, seller
  const req2 = {
    params: { id: createdProductId.toString() },
    body: {
      name: 'Task6 Test Product Updated',
      sold: 500, // Should be ignored
      view: 1000, // Should be ignored
      rating: 4.5, // Should be ignored
      seller: fakeSellerId // Should be ignored
    },
    user: seller
  } as any;
  const res2 = makeRes();
  await updateStoreProduct(req2, res2);
  console.log('Update product status:', res2.statusCode);

  const dbProduct2 = await Product.findById(createdProductId);
  if (!dbProduct2) throw new Error('Product not found');

  console.log('Updated product name:', dbProduct2.name);
  console.log('Updated product sold:', dbProduct2.sold);
  console.log('Updated product view:', dbProduct2.view);
  console.log('Updated product rating:', dbProduct2.rating);
  console.log('Updated product seller:', dbProduct2.seller?.toString());

  if (dbProduct2.name !== 'Task6 Test Product Updated') {
    throw new Error('Name update failed');
  }
  if (dbProduct2.sold !== 0 || dbProduct2.view !== 0 || dbProduct2.rating !== 0) {
    throw new Error('Mass assignment protection failed on update: sold, view or rating was updated!');
  }
  if (dbProduct2.seller?.toString() !== seller._id.toString()) {
    throw new Error('Mass assignment protection failed on update: seller ID was tampered!');
  }

  // Clean up
  await Product.deleteMany({ _id: createdProductId });
  await User.deleteMany({ _id: seller._id });

  console.log('All Task 6 tests passed successfully!');
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error('Test failed:', err);
  await mongoose.disconnect();
  process.exit(1);
});
