import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config();

// Import models
import Product from './models/Product';
import Order from './models/Order';
import User from './models/User';
import Purchase from './models/Purchase';

import { updateOrderStatus } from './controllers/order.controller';

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopee-at-home';
  console.log('Connecting to:', uri);
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  // Clean old test data
  await User.deleteMany({ email: { $in: ['buyer@test.com', 'seller@test.com', 'hacker@test.com'] } });
  await Product.deleteMany({ name: 'Task2 Product' });

  // Create users
  const buyer = new User({ email: 'buyer@test.com', password: 'pwd', name: 'Buyer', roles: ['User'] });
  await buyer.save();

  const seller = new User({ email: 'seller@test.com', password: 'pwd', name: 'Seller', roles: ['User', 'Store'] });
  await seller.save();

  const hacker = new User({ email: 'hacker@test.com', password: 'pwd', name: 'Hacker', roles: ['User'] });
  await hacker.save();

  // Create product
  const product = new Product({
    name: 'Task2 Product',
    price: 100000,
    quantity: 10,
    image: 'test.jpg',
    category: new mongoose.Types.ObjectId(),
    seller: seller._id
  });
  await product.save();

  // Create order
  const order = new Order({
    user: buyer._id,
    items: [{
      product: product._id,
      productName: product.name,
      productImage: product.image,
      buy_count: 3,
      price: product.price,
      price_before_discount: product.price
    }],
    shippingAddress: 'Address',
    recipientName: 'Buyer',
    recipientPhone: '123',
    shippingMethod: 'standard',
    shippingFee: 30000,
    paymentMethod: 'cod',
    subTotal: 300000,
    totalAmount: 330000,
    status: 1 // Pending
  });
  await order.save();

  const purchase = new Purchase({
    user: buyer._id,
    product: product._id,
    buy_count: 3,
    price: product.price,
    price_before_discount: product.price,
    status: 1
  });
  await purchase.save();

  // Helper to create mock Express response
  const makeRes = () => ({
    statusCode: 200,
    bodyData: null as any,
    status: function(code: number) { this.statusCode = code; return this; },
    json: function(data: any) { this.bodyData = data; return this; }
  } as any);

  // 1. Hacker tries to cancel / update order (IDOR check)
  const req1 = {
    params: { id: order._id.toString() },
    body: { status: 5 },
    user: hacker
  } as any;
  const res1 = makeRes();
  await updateOrderStatus(req1, res1);
  console.log('Hacker response status:', res1.statusCode);
  if (res1.statusCode !== 403) {
    throw new Error(`Expected hacker update to fail with 403, got ${res1.statusCode}`);
  }

  // 2. Buyer tries to update status to 2 (Preparing) - invalid for buyer
  const req2 = {
    params: { id: order._id.toString() },
    body: { status: 2 },
    user: buyer
  } as any;
  const res2 = makeRes();
  await updateOrderStatus(req2, res2);
  console.log('Buyer update invalid status response:', res2.statusCode);
  if (res2.statusCode !== 403) {
    throw new Error(`Expected buyer invalid status transition to fail with 403, got ${res2.statusCode}`);
  }

  // 3. Buyer cancels order (Valid status 5)
  const req3 = {
    params: { id: order._id.toString() },
    body: { status: 5 },
    user: buyer
  } as any;
  const res3 = makeRes();
  await updateOrderStatus(req3, res3);
  console.log('Buyer cancellation status:', res3.statusCode);
  if (res3.statusCode !== 200) {
    throw new Error(`Expected buyer cancel to succeed with 200, got ${res3.statusCode}`);
  }

  // Verify stock was restored from 10 to 13 (since order had buy_count = 3)
  const updatedProduct = await Product.findById(product._id);
  if (!updatedProduct) throw new Error('Product not found');
  console.log('Product quantity after cancel:', updatedProduct.quantity);
  if (updatedProduct.quantity !== 13) {
    throw new Error(`Expected product quantity to be 13, got ${updatedProduct.quantity}`);
  }

  // Clean up
  await User.deleteMany({ email: { $in: ['buyer@test.com', 'seller@test.com', 'hacker@test.com'] } });
  await Product.deleteMany({ _id: product._id });
  await Order.deleteMany({ _id: order._id });
  await Purchase.deleteMany({ _id: purchase._id });

  console.log('All Task 2 tests passed successfully!');
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error('Test failed:', err);
  await mongoose.disconnect();
  process.exit(1);
});
