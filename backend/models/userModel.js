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
  cart: [{
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true }, // Reference to Book model
    quantity: { type: Number, required: true, default: 1 } // Quantity of the book
  }],
  orderedItems: [{
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true }, // Reference to Book model
    quantity: { type: Number, required: true }, // Quantity of the book
    orderDate: { type: Date, default: Date.now } // Date of order
  }],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export { User };
