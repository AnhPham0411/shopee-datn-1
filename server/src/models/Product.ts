import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  images: string[];
  image: string;
  price: number;
  rating: number;
  price_before_discount: number;
  quantity: number;
  sold: number;
  view: number;
  category: mongoose.Types.ObjectId;
  seller?: mongoose.Types.ObjectId;   // ref User (Store owner)
  storeId?: mongoose.Types.ObjectId;  // ref Store
  video?: string;
  status: 'active' | 'hidden' | 'deleted';
  attributes?: Record<string, string>; // {color, size, material, ...}
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name:                  { type: String, required: true, trim: true },
    description:           { type: String, default: '' },
    images:                { type: [String], default: [] },
    image:                 { type: String, required: true },
    price:                 { type: Number, required: true, min: 0 },
    rating:                { type: Number, default: 0, min: 0, max: 5 },
    price_before_discount: { type: Number, default: 0 },
    quantity:              { type: Number, default: 0, min: 0 },
    sold:                  { type: Number, default: 0 },
    view:                  { type: Number, default: 0 },
    category:              { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    seller:                { type: Schema.Types.ObjectId, ref: 'User' },
    storeId:               { type: Schema.Types.ObjectId, ref: 'Store' },
    video:                 { type: String },
    status:                { type: String, enum: ['active', 'hidden', 'deleted'], default: 'active' },
    attributes:            { type: Map, of: String },
  },
  { timestamps: true }
);

// Indexes tối ưu query phổ biến
ProductSchema.index({ name: 'text', description: 'text' }); // Full-text search
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ rating: -1 });
ProductSchema.index({ sold: -1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ seller: 1 });
ProductSchema.index({ status: 1 });

export default mongoose.model<IProduct>('Product', ProductSchema);
