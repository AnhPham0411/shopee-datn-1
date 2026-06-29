import mongoose, { Document, Schema } from 'mongoose';

export interface IAddress {
  _id?: mongoose.Types.ObjectId;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detail: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  email: string;
  password?: string;
  name?: string;
  date_of_birth?: string;
  address?: string;
  addresses: IAddress[];
  avatar?: string;
  phone?: string;
  roles: string[];
  storeId?: mongoose.Types.ObjectId;
  isLocked: boolean;
  resetOtp?: string;
  resetOtpExpires?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    fullName:  { type: String, required: true, trim: true },
    phone:     { type: String, required: true, trim: true },
    province:  { type: String, required: true },
    district:  { type: String, required: true },
    ward:      { type: String, required: true },
    detail:    { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const UserSchema = new Schema<IUser>(
  {
    email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:      { type: String, required: true, select: false },
    name:          { type: String, trim: true },
    date_of_birth: { type: String },
    address:       { type: String },
    addresses:     { type: [AddressSchema], default: [] },
    avatar:        { type: String },
    phone:         { type: String },
    roles:         { type: [String], default: ['User'], enum: ['User', 'Store', 'Admin'] },
    storeId:       { type: Schema.Types.ObjectId, ref: 'Store' },
    isLocked:      { type: Boolean, default: false },
    resetOtp:        { type: String, select: false },
    resetOtpExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ roles: 1 });
UserSchema.index({ createdAt: -1 });

export default mongoose.model<IUser>('User', UserSchema);
