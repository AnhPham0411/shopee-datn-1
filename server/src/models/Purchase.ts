import mongoose, { Document, Schema } from 'mongoose';

export interface IPurchase extends Document {
  buy_count: number;
  price: number;
  price_before_discount: number;
  status: number;
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
}

const PurchaseSchema = new Schema<IPurchase>(
  {
    buy_count: { type: Number, required: true },
    price: { type: Number, required: true },
    price_before_discount: { type: Number, required: true },
    status: { type: Number, required: true, default: -1 }, // -1: in cart, 1: waiting, 2: delivering, etc.
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPurchase>('Purchase', PurchaseSchema);
