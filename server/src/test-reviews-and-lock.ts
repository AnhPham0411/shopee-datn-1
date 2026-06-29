import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config();

// Import models
import User from './models/User';
import Product from './models/Product';
import Purchase from './models/Purchase';
import Review from './models/Review';
import { toggleLockUser } from './controllers/admin.controller';
import { createReview } from './controllers/review.controller';

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopee-at-home';
  console.log('Connecting to:', uri);
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  // Clean old test data
  await User.deleteMany({ email: { $in: ['admin-test@test.com', 'buyer-test@test.com'] } });
  await Product.deleteMany({ name: 'Review Test Product' });

  // Create admin
  const admin = new User({ email: 'admin-test@test.com', password: 'pwd', name: 'Admin', roles: ['Admin'] });
  await admin.save();

  // Create buyer
  const buyer = new User({ email: 'buyer-test@test.com', password: 'pwd', name: 'Buyer', roles: ['User'] });
  await buyer.save();

  // Create product
  const product = new Product({ name: 'Review Test Product', price: 10000, quantity: 10, image: 'img.jpg', status: 'active', category: new mongoose.Types.ObjectId() });
  await product.save();

  // Helper to create mock Express response
  const makeRes = () => ({
    statusCode: 200,
    bodyData: null as any,
    status: function(code: number) { this.statusCode = code; return this; },
    json: function(data: any) { this.bodyData = data; return this; }
  } as any);

  // 1. Test admin self-locking
  const reqLock = { params: { id: admin._id.toString() }, user: admin } as any;
  const resLock = makeRes();
  await toggleLockUser(reqLock, resLock);
  console.log('Admin self-locking response status:', resLock.statusCode);
  if (resLock.statusCode !== 400) {
    throw new Error(`Expected admin self-locking to fail with 400, got ${resLock.statusCode}`);
  }

  // 2. Test review rating range validation (out of range, e.g. 6)
  const reqReviewInvalid = {
    body: { rating: 6, comment: 'Awesome!' },
    params: { id: product._id.toString() },
    user: buyer
  } as any;
  const resReviewInvalid = makeRes();
  await createReview(reqReviewInvalid, resReviewInvalid);
  console.log('Invalid rating (6) response status:', resReviewInvalid.statusCode);
  if (resReviewInvalid.statusCode !== 400) {
    throw new Error(`Expected invalid rating to fail with 400, got ${resReviewInvalid.statusCode}`);
  }

  // 3. Test review without purchase (should fail with 403)
  const reqReviewNoPurchase = {
    body: { rating: 5, comment: 'Awesome!' },
    params: { id: product._id.toString() },
    user: buyer
  } as any;
  const resReviewNoPurchase = makeRes();
  await createReview(reqReviewNoPurchase, resReviewNoPurchase);
  console.log('Review without purchase response status:', resReviewNoPurchase.statusCode);
  if (resReviewNoPurchase.statusCode !== 403) {
    throw new Error(`Expected review without purchase to fail with 403, got ${resReviewNoPurchase.statusCode}`);
  }

  // Create a purchase record for the buyer
  const purchase = new Purchase({
    product: product._id,
    user: buyer._id,
    buy_count: 1,
    price: 10000,
    price_before_discount: 10000,
    status: 4 // Completed
  });
  await purchase.save();

  // 4. Test review with valid purchase (should succeed with 200)
  const reqReviewValid = {
    body: { rating: 5, comment: 'Awesome!' },
    params: { id: product._id.toString() },
    user: buyer
  } as any;
  const resReviewValid = makeRes();
  await createReview(reqReviewValid, resReviewValid);
  console.log('Valid review response status:', resReviewValid.statusCode);
  if (resReviewValid.statusCode !== 200) {
    throw new Error(`Expected valid review to succeed with 200, got ${resReviewValid.statusCode}`);
  }

  // 5. Test duplicate review (should fail with 400)
  const reqReviewDup = {
    body: { rating: 4, comment: 'Another review' },
    params: { id: product._id.toString() },
    user: buyer
  } as any;
  const resReviewDup = makeRes();
  await createReview(reqReviewDup, resReviewDup);
  console.log('Duplicate review response status:', resReviewDup.statusCode);
  if (resReviewDup.statusCode !== 400) {
    throw new Error(`Expected duplicate review to fail with 400, got ${resReviewDup.statusCode}`);
  }

  // Clean up
  await User.deleteMany({ _id: { $in: [admin._id, buyer._id] } });
  await Product.deleteMany({ _id: product._id });
  await Purchase.deleteMany({ _id: purchase._id });
  await Review.deleteMany({ product: product._id });

  console.log('All lock and review validation tests passed successfully!');
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error('Test failed:', err);
  await mongoose.disconnect();
  process.exit(1);
});
