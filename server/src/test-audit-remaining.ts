import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config();

// Import models
import Product from './models/Product';
import Voucher from './models/Voucher';
import Order from './models/Order';
import User from './models/User';
import Purchase from './models/Purchase';

import { createOrder, updateOrderStatus } from './controllers/order.controller';
import { updateOrderStatus as adminUpdateOrderStatus, toggleLockUser } from './controllers/admin.controller';
import { getStoreOrders } from './controllers/store.controller';

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopee-at-home';
  console.log('Connecting to:', uri);
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  // Register Category model schema just in case
  import('./models/Category');

  // Clean old test data
  await User.deleteMany({ email: { $in: ['buyer_audit@test.com', 'seller_audit@test.com', 'admin_audit1@test.com', 'admin_audit2@test.com'] } });
  await Product.deleteMany({ name: 'Audit Test Product' });
  await Voucher.deleteMany({ code: 'AUDITVOUCH' });

  // Create Users
  const buyer = new User({ email: 'buyer_audit@test.com', password: 'pwd', name: 'Buyer Audit', roles: ['User'] });
  await buyer.save();

  const seller = new User({ email: 'seller_audit@test.com', password: 'pwd', name: 'Seller Audit', roles: ['Store'] });
  await seller.save();

  const admin1 = new User({ email: 'admin_audit1@test.com', password: 'pwd', name: 'Admin Audit 1', roles: ['Admin'] });
  await admin1.save();

  const admin2 = new User({ email: 'admin_audit2@test.com', password: 'pwd', name: 'Admin Audit 2', roles: ['Admin'] });
  await admin2.save();

  // Create Product
  const product = new Product({
    name: 'Audit Test Product',
    price: 100000,
    price_before_discount: 120000,
    quantity: 100,
    image: 'img.jpg',
    category: new mongoose.Types.ObjectId(),
    seller: seller._id
  });
  await product.save();

  // Create Voucher
  const voucher = new Voucher({
    code: 'AUDITVOUCH',
    title: 'Audit Voucher',
    discount_type: 'fixed',
    discount_value: 10000,
    min_order_value: 50000,
    expires_at: new Date(Date.now() + 86400000),
    usage_limit: 10,
    used_count: 0,
    isActive: true
  });
  await voucher.save();

  const makeRes = () => ({
    statusCode: 200,
    bodyData: null as any,
    status: function(code: number) { this.statusCode = code; return this; },
    json: function(data: any) { this.bodyData = data; return this; }
  } as any);

  // --- Test TASK-3: shippingFee bypass prevention ---
  const reqCreateOrder = {
    user: buyer,
    body: {
      items: [{ product_id: product._id.toString(), buy_count: 1 }],
      shippingAddress: '123 Audit St',
      shippingMethod: 'tietkiem', // should be 15000
      shippingFee: 0, // Client tries to bypass fee to 0
      paymentMethod: 'cod',
      voucherCode: 'AUDITVOUCH'
    }
  } as any;
  const resCreateOrder = makeRes();
  await createOrder(reqCreateOrder, resCreateOrder);

  if (resCreateOrder.statusCode !== 200) {
    throw new Error(`Order creation failed: ${resCreateOrder.bodyData?.message}`);
  }

  const createdOrder = await Order.findById(resCreateOrder.bodyData.data._id);
  if (!createdOrder) throw new Error('Order not found in DB');
  console.log('Created order shippingFee:', createdOrder.shippingFee);
  console.log('Created order totalAmount:', createdOrder.totalAmount);
  // subTotal = 100000
  // voucher discount = 10000
  // shippingFee tietkiem = 15000
  // totalAmount = 100000 + 15000 - 10000 = 105000
  if (createdOrder.shippingFee !== 15000) {
    throw new Error(`Expected shippingFee to be forced to 15000, got ${createdOrder.shippingFee}`);
  }
  if (createdOrder.totalAmount !== 105000) {
    throw new Error(`Expected totalAmount to be 105000, got ${createdOrder.totalAmount}`);
  }
  console.log('✅ TASK-3 Passed: shippingFee bypass prevented!');

  // Check voucher used_count
  const voucherAfterCreate = await Voucher.findById(voucher._id);
  console.log('Voucher used_count after checkout:', voucherAfterCreate?.used_count);
  if (voucherAfterCreate?.used_count !== 1) {
    throw new Error(`Expected voucher used_count to be 1, got ${voucherAfterCreate?.used_count}`);
  }

  // --- Test TASK-8: Voucher used_count is decremented back on cancellation ---
  const reqCancel = {
    params: { id: createdOrder._id.toString() },
    body: { status: 5 },
    user: buyer
  } as any;
  const resCancel = makeRes();
  await updateOrderStatus(reqCancel, resCancel);
  console.log('Buyer cancel order response status:', resCancel.statusCode);
  if (resCancel.statusCode !== 200) {
    throw new Error(`Expected buyer cancel to succeed with 200, got ${resCancel.statusCode}`);
  }

  const voucherAfterCancel = await Voucher.findById(voucher._id);
  console.log('Voucher used_count after cancel:', voucherAfterCancel?.used_count);
  if (voucherAfterCancel?.used_count !== 0) {
    throw new Error(`Expected voucher used_count to be reverted to 0, got ${voucherAfterCancel?.used_count}`);
  }
  console.log('✅ TASK-8 Passed: Voucher used_count restored on cancellation!');

  // --- Test TASK-1 & 2: Buyer status transition validations ---
  // Create another order for buyer status transitions tests
  const resNewOrder = makeRes();
  await createOrder(reqCreateOrder, resNewOrder);
  const orderForTransitions = await Order.findById(resNewOrder.bodyData.data._id);
  if (!orderForTransitions) throw new Error('Order not found');

  // Order status is currently 1.
  // Test Case A: Buyer tries to cancel on status 2 (should fail because buyer can only cancel status 1)
  orderForTransitions.status = 2; // Simulate preparing goods
  await orderForTransitions.save();

  const reqCancel2 = {
    params: { id: orderForTransitions._id.toString() },
    body: { status: 5 },
    user: buyer
  } as any;
  const resCancel2 = makeRes();
  await updateOrderStatus(reqCancel2, resCancel2);
  console.log('Buyer cancels on status 2 response status:', resCancel2.statusCode);
  if (resCancel2.statusCode !== 403) {
    throw new Error(`Expected cancel on status 2 to fail with 403, got ${resCancel2.statusCode}`);
  }

  // Test Case B: Buyer tries to confirm received (3 -> 4) on status 3 (delivering) -> should succeed
  orderForTransitions.status = 3; // Simulate delivering
  await orderForTransitions.save();

  const reqConfirm = {
    params: { id: orderForTransitions._id.toString() },
    body: { status: 4 },
    user: buyer
  } as any;
  const resConfirm = makeRes();
  await updateOrderStatus(reqConfirm, resConfirm);
  console.log('Buyer confirms received (3->4) response status:', resConfirm.statusCode);
  if (resConfirm.statusCode !== 200) {
    throw new Error(`Expected buyer confirm received to succeed with 200, got ${resConfirm.statusCode}`);
  }

  // Test Case C: Admin or Buyer tries to transition out of ended order (status 4) -> should fail with 400
  const reqModifyEnded = {
    params: { id: orderForTransitions._id.toString() },
    body: { status: 1 },
    user: admin1
  } as any;
  const resModifyEnded = makeRes();
  await adminUpdateOrderStatus(reqModifyEnded, resModifyEnded);
  console.log('Modify ended order response status:', resModifyEnded.statusCode);
  if (resModifyEnded.statusCode !== 400) {
    throw new Error(`Expected modifying ended order to fail with 400, got ${resModifyEnded.statusCode}`);
  }
  console.log('✅ TASK-1, TASK-2, TASK-6 Passed: Order transitions and boundary checks verified!');

  // --- Test TASK-4: Remove buyer email from store orders ---
  const reqStoreOrders = { user: seller } as any;
  const resStoreOrders = makeRes();
  await getStoreOrders(reqStoreOrders, resStoreOrders);
  console.log('getStoreOrders response status:', resStoreOrders.statusCode);
  const purchaseRecords = resStoreOrders.bodyData.data;
  console.log('Store orders purchase records returned:', purchaseRecords.length);
  if (purchaseRecords.length > 0) {
    const recordUser = purchaseRecords[0].user;
    console.log('User details populated for store:', JSON.stringify(recordUser));
    if (recordUser.email) {
      throw new Error(`Store orders populated email field! This violates TASK-4.`);
    }
  }
  console.log('✅ TASK-4 Passed: Buyer email is hidden from Store role!');

  // --- Test TASK-7: Admin locking admin checks ---
  // Admin 1 attempts to lock Admin 2 (should fail with 403)
  const reqLockOtherAdmin = { params: { id: admin2._id.toString() }, user: admin1 } as any;
  const resLockOtherAdmin = makeRes();
  await toggleLockUser(reqLockOtherAdmin, resLockOtherAdmin);
  console.log('Lock other admin response status:', resLockOtherAdmin.statusCode);
  if (resLockOtherAdmin.statusCode !== 403) {
    throw new Error(`Expected locking another admin to fail with 403, got ${resLockOtherAdmin.statusCode}`);
  }
  console.log('✅ TASK-7 Passed: Admin cannot lock other admins!');

  // Clean up
  await User.deleteMany({ _id: { $in: [buyer._id, seller._id, admin1._id, admin2._id] } });
  await Product.deleteMany({ _id: product._id });
  await Voucher.deleteMany({ _id: voucher._id });
  await Order.deleteMany({ user: buyer._id });
  await Purchase.deleteMany({ user: buyer._id });

  console.log('All remaining audit tests passed successfully!');
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error('Test failed:', err);
  await mongoose.disconnect();
  process.exit(1);
});
