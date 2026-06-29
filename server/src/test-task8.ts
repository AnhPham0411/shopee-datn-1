import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config();

// Import models
import Product from './models/Product';
import Category from './models/Category';
import { getProducts, getProductById, getRecommendations, suggestProducts } from './controllers/product.controller';

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopee-at-home';
  console.log('Connecting to:', uri);
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
  console.log('Category model registered:', Category.modelName);

  // Clean old test data
  await Product.deleteMany({ name: { $in: ['T8 Active', 'T8 Hidden', 'T8 Deleted'] } });

  const catId = new mongoose.Types.ObjectId();

  // Create active product
  const activeProduct = new Product({
    name: 'T8 Active',
    price: 10000,
    quantity: 10,
    image: 'test.jpg',
    category: catId,
    status: 'active'
  });
  await activeProduct.save();

  // Create hidden product
  const hiddenProduct = new Product({
    name: 'T8 Hidden',
    price: 20000,
    quantity: 5,
    image: 'test.jpg',
    category: catId,
    status: 'hidden'
  });
  await hiddenProduct.save();

  // Create deleted product
  const deletedProduct = new Product({
    name: 'T8 Deleted',
    price: 30000,
    quantity: 0,
    image: 'test.jpg',
    category: catId,
    status: 'deleted'
  });
  await deletedProduct.save();

  // Helper to create mock Express response
  const makeRes = () => ({
    statusCode: 200,
    bodyData: null as any,
    status: function(code: number) { this.statusCode = code; return this; },
    json: function(data: any) { this.bodyData = data; return this; }
  } as any);

  // 1. Test getProducts: should only return active products
  const req1 = { query: { name: 'T8' } } as any;
  const res1 = makeRes();
  await getProducts(req1, res1);
  const productsList = res1.bodyData.data.products;
  console.log('getProducts returned count:', productsList.length);
  const nonActiveInList = productsList.filter((p: any) => p.status !== 'active');
  if (nonActiveInList.length > 0) {
    throw new Error('getProducts returned non-active products!');
  }

  // 2. Test getProductById:
  // Active -> success
  const req2a = { params: { id: activeProduct._id.toString() } } as any;
  const res2a = makeRes();
  await getProductById(req2a, res2a);
  console.log('getProductById active product response:', res2a.statusCode);
  if (res2a.statusCode !== 200) {
    throw new Error(`Expected active product lookup to succeed with 200, got ${res2a.statusCode}`);
  }

  // Hidden -> fail
  const req2b = { params: { id: hiddenProduct._id.toString() } } as any;
  const res2b = makeRes();
  await getProductById(req2b, res2b);
  console.log('getProductById hidden product response:', res2b.statusCode);
  if (res2b.statusCode !== 404) {
    throw new Error(`Expected hidden product lookup to fail with 404, got ${res2b.statusCode}`);
  }

  // 3. Test getRecommendations: should only return active products
  const req3 = { query: { category: catId.toString(), limit: '6' } } as any;
  const res3 = makeRes();
  await getRecommendations(req3, res3);
  const recommendationsList = res3.bodyData.data;
  console.log('getRecommendations returned count:', recommendationsList.length);
  const nonActiveInRecs = recommendationsList.filter((p: any) => p.status !== 'active');
  if (nonActiveInRecs.length > 0) {
    throw new Error('getRecommendations returned non-active products!');
  }

  // 4. Test suggestProducts: should only return active products
  const req4 = { query: { q: 'T8', limit: '5' } } as any;
  const res4 = makeRes();
  await suggestProducts(req4, res4);
  const suggestionsList = res4.bodyData.data;
  console.log('suggestProducts returned count:', suggestionsList.length);
  // suggestions list is lean select 'name image price' so status is not there,
  // but we check by retrieving the full products from DB for the suggestions returned
  for (const p of suggestionsList) {
    const full = await Product.findOne({ name: p.name });
    if (full && full.status !== 'active') {
      throw new Error(`suggestProducts returned non-active product: ${p.name}`);
    }
  }

  // Clean up
  await Product.deleteMany({ _id: { $in: [activeProduct._id, hiddenProduct._id, deletedProduct._id] } });

  console.log('All Task 8 tests passed successfully!');
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error('Test failed:', err);
  await mongoose.disconnect();
  process.exit(1);
});
