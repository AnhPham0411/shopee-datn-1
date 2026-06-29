import mongoose from 'mongoose';
import Order from './server/src/models/Order';
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopee-clone').then(async () => {
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    return d;
  }).reverse();

  for (let i = 0; i < last7Days.length; i++) {
    const start = last7Days[i];
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const dayOrders = await Order.find({
      status: 4,
      updatedAt: { $gte: start, $lt: end }
    }).populate('items.product');

    console.log(`Date: ${start.toISOString()} to ${end.toISOString()} - Found: ${dayOrders.length}`);
  }
  process.exit();
});
