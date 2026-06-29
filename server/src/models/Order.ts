import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  productName: string;    // snapshot tên tại thời điểm mua
  productImage: string;   // snapshot ảnh
  storeId?: mongoose.Types.ObjectId;
  buy_count: number;
  price: number;
  price_before_discount: number;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: string;
  recipientName: string;
  recipientPhone: string;
  shippingMethod: 'standard' | 'express' | 'sameday';
  shippingFee: number;
  paymentMethod: 'cod' | 'bank_transfer' | 'e_wallet';
  paymentStatus: 'pending' | 'paid' | 'failed';
  subTotal: number;      // tổng trước ship & voucher
  discountAmount: number;
  totalAmount: number;   // = subTotal + shippingFee - discountAmount
  voucherCode?: string;
  voucherId?: mongoose.Types.ObjectId;
  // status: 1=chờ xác nhận, 2=chuẩn bị hàng, 3=đang giao, 4=hoàn thành, 5=đã hủy
  status: number;
  note?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  product:               { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productName:           { type: String, required: true },
  productImage:          { type: String, required: true },
  storeId:               { type: Schema.Types.ObjectId, ref: 'Store' },
  buy_count:             { type: Number, required: true, min: 1 },
  price:                 { type: Number, required: true },
  price_before_discount: { type: Number, required: true },
});

const OrderSchema = new Schema<IOrder>(
  {
    user:            { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items:           [OrderItemSchema],
    shippingAddress: { type: String, required: true },
    recipientName:   { type: String, required: true },
    recipientPhone:  { type: String, required: true },
    shippingMethod:  { type: String, enum: ['standard', 'express', 'sameday'], required: true },
    shippingFee:     { type: Number, required: true, min: 0 },
    paymentMethod:   { type: String, enum: ['cod', 'bank_transfer', 'e_wallet'], required: true },
    paymentStatus:   { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    subTotal:        { type: Number, required: true },
    discountAmount:  { type: Number, default: 0 },
    totalAmount:     { type: Number, required: true },
    voucherCode:     { type: String },
    voucherId:       { type: Schema.Types.ObjectId, ref: 'Voucher' },
    status:          { type: Number, required: true, default: 1 },
    note:            { type: String },
  },
  { timestamps: true }
);

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ 'items.storeId': 1, status: 1 }); // cho store dashboard
OrderSchema.index({ createdAt: -1 });                  // cho admin stats

export default mongoose.model<IOrder>('Order', OrderSchema);
