import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config();

// Import models
import Voucher from './models/Voucher';
import { createVoucher, applyVoucher } from './controllers/voucher.controller';

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopee-at-home';
  console.log('Connecting to:', uri);
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  // Clean old test data
  await Voucher.deleteMany({ code: { $in: ['VTEST1', 'VTEST2', 'VTEST3'] } });

  // Helper to create mock Express response
  const makeRes = () => ({
    statusCode: 200,
    bodyData: null as any,
    status: function(code: number) { this.statusCode = code; return this; },
    json: function(data: any) { this.bodyData = data; return this; }
  } as any);

  // Test Case 1: Create voucher with missing title -> should fail
  const req1 = {
    body: {
      code: 'VTEST1',
      discount_type: 'percent',
      discount_value: 20,
      usage_limit: 10,
      expires_at: new Date(Date.now() + 86400000)
    },
    user: { roles: ['Admin'] }
  } as any;
  const res1 = makeRes();
  await createVoucher(req1, res1);
  console.log('Create missing title response:', res1.statusCode);
  if (res1.statusCode !== 400) {
    throw new Error(`Expected missing title creation to fail with 400, got ${res1.statusCode}`);
  }

  // Test Case 2: Create voucher with invalid percentage (> 100) -> should fail
  const req2 = {
    body: {
      code: 'VTEST1',
      title: 'Invalid Percent Voucher',
      discount_type: 'percent',
      discount_value: 120, // invalid percentage
      usage_limit: 10,
      expires_at: new Date(Date.now() + 86400000)
    },
    user: { roles: ['Admin'] }
  } as any;
  const res2 = makeRes();
  await createVoucher(req2, res2);
  console.log('Create invalid percentage response:', res2.statusCode);
  if (res2.statusCode !== 400) {
    throw new Error(`Expected invalid percentage to fail with 400, got ${res2.statusCode}`);
  }

  // Test Case 3: Create voucher with past expiry date -> should fail
  const req3 = {
    body: {
      code: 'VTEST1',
      title: 'Expired Voucher',
      discount_type: 'fixed',
      discount_value: 10000,
      usage_limit: 10,
      expires_at: new Date(Date.now() - 3600000) // past date
    },
    user: { roles: ['Admin'] }
  } as any;
  const res3 = makeRes();
  await createVoucher(req3, res3);
  console.log('Create expired date response:', res3.statusCode);
  if (res3.statusCode !== 400) {
    throw new Error(`Expected past expiry to fail with 400, got ${res3.statusCode}`);
  }

  // Test Case 4: Create valid voucher -> should succeed
  const req4 = {
    body: {
      code: 'VTEST1',
      title: 'Valid Voucher 50%',
      discount_type: 'percent',
      discount_value: 50,
      usage_limit: 10,
      expires_at: new Date(Date.now() + 86400000)
    },
    user: { roles: ['Admin'] }
  } as any;
  const res4 = makeRes();
  await createVoucher(req4, res4);
  console.log('Create valid voucher response:', res4.statusCode);
  if (res4.statusCode !== 201) {
    throw new Error(`Expected valid voucher creation to succeed with 201, got ${res4.statusCode}`);
  }

  // Test Case 5: Apply inactive voucher -> should fail
  const inactiveVoucher = await Voucher.findOne({ code: 'VTEST1' });
  if (inactiveVoucher) {
    inactiveVoucher.isActive = false;
    await inactiveVoucher.save();
  }

  const req5 = {
    body: { code: 'VTEST1', order_value: 100000 }
  } as any;
  const res5 = makeRes();
  await applyVoucher(req5, res5);
  console.log('Apply inactive voucher response:', res5.statusCode);
  if (res5.statusCode !== 400) {
    throw new Error(`Expected inactive voucher application to fail with 400, got ${res5.statusCode}`);
  }

  // Clean up
  await Voucher.deleteMany({ code: { $in: ['VTEST1', 'VTEST2', 'VTEST3'] } });

  console.log('All Task 4 tests passed successfully!');
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error('Test failed:', err);
  await Voucher.deleteMany({ code: { $in: ['VTEST1', 'VTEST2', 'VTEST3'] } });
  await mongoose.disconnect();
  process.exit(1);
});
