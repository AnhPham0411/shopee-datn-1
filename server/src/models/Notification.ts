import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: string;        // 'order' | 'system' ...
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt?: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type:    { type: String, default: 'system' },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    link:    { type: String },
    isRead:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
