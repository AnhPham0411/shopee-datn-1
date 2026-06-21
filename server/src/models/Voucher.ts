import mongoose, { Document, Schema } from 'mongoose';

export interface IVoucher extends Document {
  code: string;
  title: string;                           // Mô tả hiển thị
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_order_value: number;
  max_discount_amount?: number;            // Chỉ áp dụng khi discount_type = 'percent'
  expires_at: Date;
  starts_at: Date;
  usage_limit: number;
  used_count: number;
  isActive: boolean;
  scope: 'global' | 'store';              // global = Shopee voucher, store = voucher cửa hàng
  seller?: mongoose.Types.ObjectId;       // ref User, null nếu là global voucher
  storeId?: mongoose.Types.ObjectId;      // ref Store
  createdAt?: Date;
  updatedAt?: Date;
}

const voucherSchema = new Schema(
  {
    code:               { type: String, required: true, unique: true, uppercase: true, trim: true },
    title:              { type: String, required: true },
    discount_type:      { type: String, enum: ['percent', 'fixed'], required: true },
    discount_value:     { type: Number, required: true, min: 0 },
    min_order_value:    { type: Number, default: 0 },
    max_discount_amount:{ type: Number },
    expires_at:         { type: Date, required: true },
    starts_at:          { type: Date, default: Date.now },
    usage_limit:        { type: Number, required: true, min: 1 },
    used_count:         { type: Number, default: 0 },
    isActive:           { type: Boolean, default: true },
    scope:              { type: String, enum: ['global', 'store'], default: 'global' },
    seller:             { type: Schema.Types.ObjectId, ref: 'User' },
    storeId:            { type: Schema.Types.ObjectId, ref: 'Store' },
  },
  { timestamps: true }
);

voucherSchema.index({ code: 1 });
voucherSchema.index({ storeId: 1, isActive: 1 });
voucherSchema.index({ expires_at: 1, isActive: 1 });

export default mongoose.model<IVoucher>('Voucher', voucherSchema);
