import mongoose, { Schema, Document } from 'mongoose';

export interface ILocation extends Document {
  orderId: mongoose.Types.ObjectId;
  deliveryPartnerId: mongoose.Types.ObjectId;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  timestamp: number;
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema: Schema = new Schema({
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  deliveryPartnerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  timestamp: {
    type: Number,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create a geospatial index on the location field
LocationSchema.index({ location: '2dsphere' });

export const LocationModel = mongoose.model<ILocation>('Location', LocationSchema);