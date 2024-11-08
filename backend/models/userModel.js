import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },  // Enum for gender
  age: { type: Number, required: true },
  favorites: { type: [String], default: [] },  // Array of strings for favorites
  address: { type: String, required: true },  // Address field
  pincode: { type: String, required: true },  // Pincode field
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export { User };
