const mongoose = require('mongoose');
const { Schema } = mongoose;
const OrderSchema = new Schema({
  status: Number,
  updatedAt: Date
}, { collection: 'orders' });
const Order = mongoose.model('Order', OrderSchema);

mongoose.connect('mongodb://localhost:27017/shopee-clone').then(async () => {
  const d = new Date();
  d.setDate(21);
  d.setHours(0,0,0,0);
  const end = new Date(d);
  end.setDate(22);
  
  const orders = await Order.find({ status: 4, updatedAt: { $gte: d, $lt: end } });
  console.log("Found with Mongoose:", orders.length);
  process.exit(0);
});
