import mongoose, { Document, Schema } from 'mongoose';

export interface IPromotion extends Document {
  product: mongoose.Types.ObjectId;
  title?: string;                       // Tên chương trình Flash Sale
  discount_percent: number;
  original_price: number;               // Snapshot giá gốc
  flash_price: number;                  // Giá sau giảm
  stock_limit?: number;                 // Giới hạn số lượng trong Flash Sale
  sold_in_sale: number;                 // Đã bán trong đợt Flash Sale này
  start_time: Date;
  end_time: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const PromotionSchema = new Schema<IPromotion>(
  {
    product:          { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    title:            { type: String },
    discount_percent: { type: Number, required: true, min: 1, max: 99 },
    original_price:   { type: Number, required: true },
    flash_price:      { type: Number, required: true },
    stock_limit:      { type: Number },
    sold_in_sale:     { type: Number, default: 0 },
    start_time:       { type: Date, required: true },
    end_time:         { type: Date, required: true },
    isActive:         { type: Boolean, default: true },
  },
  { timestamps: true }
);

PromotionSchema.index({ product: 1, isActive: 1 });
PromotionSchema.index({ end_time: 1, isActive: 1 }); // query active flash sales

export default mongoose.model<IPromotion>('Promotion', PromotionSchema);
