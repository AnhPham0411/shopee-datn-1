import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Configure dotenv
dotenv.config();

// Import models
import Product from './models/Product';
import Voucher from './models/Voucher';
import Promotion from './models/Promotion';
import Order from './models/Order';
import User from './models/User';
import Purchase from './models/Purchase';

import { createOrder } from './controllers/order.controller';

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopee-at-home';
  console.log('Connecting to:', uri);
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  // Clean old test data
  await User.deleteMany({ email: 'test_buyer@gmail.com' });
  await Product.deleteMany({ name: 'Test Product T1' });
  await Voucher.deleteMany({ code: 'VOUCHERT1' });
  await Promotion.deleteMany({ title: 'FlashSaleT1' });

  // Create test structures
  const user = new User({
    email: 'test_buyer@gmail.com',
    password: 'password123',
    name: 'Test Buyer',
    roles: ['User']
  });
  await user.save();

  const product = new Product({
    name: 'Test Product T1',
    description: 'Test product description',
    price: 100000,
    price_before_discount: 150000,
    quantity: 10,
    image: 'test.jpg',
    category: new mongoose.Types.ObjectId() // Dummy category
  });
  await product.save();

  const voucher = new Voucher({
    code: 'VOUCHERT1',
    title: 'Test Voucher 20k',
    discount_type: 'fixed',
    discount_value: 20000,
    min_order_value: 50000,
    expires_at: new Date(Date.now() + 86400000), // tomorrow
    usage_limit: 5,
    used_count: 0,
    isActive: true
  });
  await voucher.save();

  const promotion = new Promotion({
    product: product._id,
    title: 'FlashSaleT1',
    discount_percent: 50,
    original_price: 100000,
    flash_price: 50000, // 50% discount
    stock_limit: 5,
    sold_in_sale: 0,
    start_time: new Date(Date.now() - 3600000), // 1h ago
    end_time: new Date(Date.now() + 3600000), // 1h later
    isActive: true
  });
  await promotion.save();

  // Test Case 1: Order creation with Promotion & Voucher & Stock Deduction
  const req = {
    user: user,
    body: {
      items: [
        { product_id: product._id.toString(), buy_count: 2 }
      ],
      shippingAddress: '123 Test St',
      shippingMethod: 'tietkiem', // should map to sameday / 15000 fee on server
      shippingFee: 15000,
      paymentMethod: 'cod',
      voucherCode: 'VOUCHERT1'
    }
  } as any;

  const res = {
    statusCode: 200,
    bodyData: null,
    status: function(code: number) {
      this.statusCode = code;
      return this;
    },
    json: function(data: any) {
      this.bodyData = data;
      return this;
    }
  } as any;

  await createOrder(req, res);

  console.log('Response status:', res.statusCode);
  console.log('Response body:', JSON.stringify(res.bodyData, null, 2));

  // Assertions
  if (res.statusCode !== 200) {
    throw new Error(`Order creation failed with status ${res.statusCode}: ${res.bodyData?.message}`);
  }

  // 1. Stock deduction validation
  const updatedProduct = await Product.findById(product._id);
  if (!updatedProduct) throw new Error('Product not found');
  console.log('Updated stock:', updatedProduct.quantity);
  console.log('Updated sold:', updatedProduct.sold);
  if (updatedProduct.quantity !== 8) {
    throw new Error(`Expected product quantity to be 8, got ${updatedProduct.quantity}`);
  }
  if (updatedProduct.sold !== 2) {
    throw new Error(`Expected product sold count to be 2, got ${updatedProduct.sold}`);
  }

  // 2. Promotion application validation
  // Test case uses active promotion, so final price per item should be 50000 instead of 100000
  // subTotal = 50000 * 2 = 100000
  // voucher discount fixed = 20000
  // shippingFee tietkiem = 15000
  // totalAmount = 100000 + 15000 - 20000 = 95000
  const order = await Order.findById(res.bodyData.data._id);
  if (!order) throw new Error('Order not found');
  console.log('Order subTotal:', order.subTotal);
  console.log('Order discountAmount:', order.discountAmount);
  console.log('Order totalAmount:', order.totalAmount);

  if (order.subTotal !== 100000) {
    throw new Error(`Expected subTotal to be 100000, got ${order.subTotal}`);
  }
  if (order.discountAmount !== 20000) {
    throw new Error(`Expected discountAmount to be 20000, got ${order.discountAmount}`);
  }
  if (order.totalAmount !== 95000) {
    throw new Error(`Expected totalAmount to be 95000, got ${order.totalAmount}`);
  }

  // 3. Voucher used_count increment
  const updatedVoucher = await Voucher.findById(voucher._id);
  if (!updatedVoucher) throw new Error('Voucher not found');
  console.log('Voucher used_count:', updatedVoucher.used_count);
  if (updatedVoucher.used_count !== 1) {
    throw new Error(`Expected voucher used_count to be 1, got ${updatedVoucher.used_count}`);
  }

  // 4. Promotion sold_in_sale increment
  const updatedPromotion = await Promotion.findById(promotion._id);
  if (!updatedPromotion) throw new Error('Promotion not found');
  console.log('Promotion sold_in_sale:', updatedPromotion.sold_in_sale);
  if (updatedPromotion.sold_in_sale !== 2) {
    throw new Error(`Expected promotion sold_in_sale to be 2, got ${updatedPromotion.sold_in_sale}`);
  }

  // Test Case 2: Reject purchase exceeding stock
  const req2 = {
    user: user,
    body: {
      items: [
        { product_id: product._id.toString(), buy_count: 9 } // stock is 8 now
      ],
      shippingAddress: '123 Test St',
      shippingMethod: 'standard',
      shippingFee: 30000,
      paymentMethod: 'cod'
    }
  } as any;

  const res2 = {
    statusCode: 200,
    bodyData: null,
    status: function(code: number) {
      this.statusCode = code;
      return this;
    },
    json: function(data: any) {
      this.bodyData = data;
      return this;
    }
  } as any;

  await createOrder(req2, res2);
  console.log('Response status (exceeding stock):', res2.statusCode);
  if (res2.statusCode !== 400) {
    throw new Error(`Expected status 400 when exceeding stock, got ${res2.statusCode}`);
  }

  // Clean test records
  await User.deleteMany({ email: 'test_buyer@gmail.com' });
  await Product.deleteMany({ name: 'Test Product T1' });
  await Voucher.deleteMany({ code: 'VOUCHERT1' });
  await Promotion.deleteMany({ title: 'FlashSaleT1' });
  await Order.deleteMany({ user: user._id });
  await Purchase.deleteMany({ user: user._id });

  console.log('All Task 1 tests passed successfully!');
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error('Test failed:', err);
  await mongoose.disconnect();
  process.exit(1);
});
