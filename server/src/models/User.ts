import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string;
  name?: string;
  date_of_birth?: string;
  address?: string;
  avatar?: string;
  phone?: string;
  roles: string[];
  storeId?: mongoose.Types.ObjectId;
  isLocked: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:      { type: String, required: true, select: false },
    name:          { type: String, trim: true },
    date_of_birth: { type: String },
    address:       { type: String },
    avatar:        { type: String },
    phone:         { type: String },
    roles:         { type: [String], default: ['User'], enum: ['User', 'Store', 'Admin'] },
    storeId:       { type: Schema.Types.ObjectId, ref: 'Store' },
    isLocked:      { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ roles: 1 });
UserSchema.index({ createdAt: -1 });

export default mongoose.model<IUser>('User', UserSchema);
