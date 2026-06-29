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
    status: { type: Number, required: true, default: -1 }, // -1: trong giỏ, 1: chờ xác nhận, 2: chuẩn bị hàng, 3: đang giao, 4: hoàn thành, 5: đã hủy
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPurchase>('Purchase', PurchaseSchema);
