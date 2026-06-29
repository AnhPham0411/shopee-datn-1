import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config();

// Import models
import User from './models/User';
import { register } from './controllers/auth.controller';

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopee-at-home';
  console.log('Connecting to:', uri);
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  // Clean old test data
  await User.deleteMany({ email: { $in: ['valid@test.com', 'invalid-email', ''] } });

  // Helper to create mock Express response
  const makeRes = () => ({
    statusCode: 200,
    bodyData: null as any,
    status: function(code: number) { this.statusCode = code; return this; },
    json: function(data: any) { this.bodyData = data; return this; }
  } as any);

  // Test Case 1: Register with invalid email
  const req1 = {
    body: { email: 'invalid-email', password: 'password123' }
  } as any;
  const res1 = makeRes();
  await register(req1, res1);
  console.log('Invalid email response status:', res1.statusCode);
  if (res1.statusCode !== 422) {
    throw new Error(`Expected invalid email register to fail with 422, got ${res1.statusCode}`);
  }

  // Test Case 2: Register with too short password
  const req2 = {
    body: { email: 'valid@test.com', password: '123' }
  } as any;
  const res2 = makeRes();
  await register(req2, res2);
  console.log('Short password response status:', res2.statusCode);
  if (res2.statusCode !== 422) {
    throw new Error(`Expected short password register to fail with 422, got ${res2.statusCode}`);
  }

  // Test Case 3: Register with valid details
  const req3 = {
    body: { email: 'valid@test.com', password: 'password123' }
  } as any;
  const res3 = makeRes();
  await register(req3, res3);
  console.log('Valid register response status:', res3.statusCode);
  if (res3.statusCode !== 200) {
    throw new Error(`Expected valid register to succeed with 200, got ${res3.statusCode}`);
  }

  // Clean up
  await User.deleteMany({ email: 'valid@test.com' });

  console.log('All Task 7 tests passed successfully!');
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error('Test failed:', err);
  await mongoose.disconnect();
  process.exit(1);
});
