import express, { Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/category.routes';
import purchaseRoutes from './routes/purchase.routes';
import promotionRoutes from './routes/promotion.routes';
import wishlistRoutes from './routes/wishlist.routes';
import orderRoutes from './routes/order.routes';
import contactRoutes from './routes/contact.routes';
import storeRoutes from './routes/store.routes';
import adminRoutes from './routes/admin.routes';
import userRoutes from './routes/user.routes';
import voucherRoutes from './routes/voucher.routes';
import reviewRoutes from './routes/review.routes';
import paymentRoutes from './routes/payment.routes';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3001',
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', authRoutes);
app.use('/', productRoutes);
app.use('/', categoryRoutes);
app.use('/purchases', purchaseRoutes);
app.use('/promotions', promotionRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/orders', orderRoutes);
app.use('/contact', contactRoutes);
app.use('/store', storeRoutes);
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);
app.use('/vouchers', voucherRoutes);
app.use('/products', reviewRoutes);
app.use('/payment', paymentRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
  console.error('Global Error:', err);
  res.status(500).json({ message: 'Lỗi server', data: err.message });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopee-clone';
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();
