import mongoose from 'mongoose';

const sellerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  companyName: { type: String, required: true },  // Field for the seller's company name
  registrationNumber: { type: String, unique: true },  // Unique field for business registration number
  address: { type: String, required: true },  // Address field
  pincode: { type: String, required: true },  // Pincode field
  products: { type: [String], default: [] },  // Array of product IDs or names
  ratings: { type: Number, default: 0 },  // Average rating
}, { timestamps: true });

const Seller = mongoose.model('Seller', sellerSchema);

export { Seller };
