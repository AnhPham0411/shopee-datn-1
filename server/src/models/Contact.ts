import mongoose, { Document, Schema } from 'mongoose';

export interface IContact extends Document {
  name: string;
  email: string;
  message: string;
  status: number; // 0: new, 1: read, 2: resolved
}

const ContactSchema = new Schema<IContact>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model<IContact>('Contact', ContactSchema);
