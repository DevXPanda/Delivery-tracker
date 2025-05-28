import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'vendor' | 'delivery' | 'customer' | 'admin';
  phone?: string;
  address?: string;
  vendorInfo?: {
    businessName: string;
    businessAddress: string;
    businessPhone: string;
    businessEmail: string;
    logo?: string;
  };
  deliveryInfo?: {
    vehicleType: string;
    vehicleNumber: string;
    licenseNumber: string;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['vendor', 'delivery', 'customer', 'admin'],
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  vendorInfo: {
    businessName: String,
    businessAddress: String,
    businessPhone: String,
    businessEmail: String,
    logo: String
  },
  deliveryInfo: {
    vehicleType: String,
    vehicleNumber: String,
    licenseNumber: String
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const UserModel = mongoose.model<IUser>('User', UserSchema);