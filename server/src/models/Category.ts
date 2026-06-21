import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  image?: string;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    image: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ICategory>('Category', CategorySchema);
