import mongoose, { Document, Schema } from 'mongoose';

export interface IStore extends Document {
  owner: mongoose.Types.ObjectId;       // ref User
  name: string;
  description?: string;
  logo?: string;
  banner?: string;
  address?: string;
  phone?: string;
  isApproved: boolean;
  isLocked: boolean;
  followerCount: number;
  rating: number;
  totalSold: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const StoreSchema = new Schema<IStore>(
  {
    owner:         { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name:          { type: String, required: true, trim: true },
    description:   { type: String, default: '' },
    logo:          { type: String },
    banner:        { type: String },
    address:       { type: String },
    phone:         { type: String },
    isApproved:    { type: Boolean, default: false },
    isLocked:      { type: Boolean, default: false },
    followerCount: { type: Number, default: 0 },
    rating:        { type: Number, default: 0 },
    totalSold:     { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index để tìm cửa hàng theo tên
StoreSchema.index({ name: 'text' });

export default mongoose.model<IStore>('Store', StoreSchema);
