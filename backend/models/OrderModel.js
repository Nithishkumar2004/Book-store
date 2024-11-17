import mongoose from 'mongoose';

// Order Schema
const orderSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Reference to the User model
    required: true
  },
  sellerIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',  // Reference to the Seller model
    required: true
  }],
  items: [
    {
      bookId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Book', 
        required: true 
      },
      quantity: { 
        type: Number, 
        required: true 
      },
      price: { 
        type: Number, 
        required: true 
      },
      sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true
      }
    }
  ],
  totalPrice: { 
    type: Number, 
    required: true 
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  shippingAddress: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Order Model
const Order = mongoose.model('Order', orderSchema);

export { Order };
