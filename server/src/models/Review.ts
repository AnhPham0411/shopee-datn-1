import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  order?: mongoose.Types.ObjectId;  // Liên kết đơn hàng để verify đã mua
  rating: number;
  comment: string;
  images: string[];
  helpfulCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    product:      { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    user:         { type: Schema.Types.ObjectId, ref: 'User', required: true },
    order:        { type: Schema.Types.ObjectId, ref: 'Order' },
    rating:       { type: Number, required: true, min: 1, max: 5 },
    comment:      { type: String, required: true, maxlength: 2000 },
    images:       { type: [String], default: [] },
    helpfulCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Mỗi user chỉ review 1 lần cho mỗi sản phẩm
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });
ReviewSchema.index({ product: 1, rating: 1 });
ReviewSchema.index({ product: 1, createdAt: -1 });

export default mongoose.model<IReview>('Review', ReviewSchema);
