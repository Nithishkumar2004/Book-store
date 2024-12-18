import express from 'express';
import mongoose from 'mongoose';
import booksRoute from './routes/booksRoute.js';
import userRoute from './routes/userRoute.js';
import sellerRoute from './routes/sellerRoute.js';
import AdminRoute from './routes/adminRoute.js';
import OrderRoute from './routes/OrderRoute.js';


import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';

dotenv.config();
const PORT = process.env.PORT || 3000;
const mongoDBURL = process.env.mongoDBURL;

const __dirname = path.resolve();
const app = express();

// middlewares

app.use(cors({
  origin: 'http://localhost:5173', // The URL of your frontend
  credentials: true,               // Allow credentials (cookies, authorization headers)
}));
app.use(express.json());

// routes
app.use('/books', booksRoute);
app.use('/user', userRoute);
app.use('/seller', sellerRoute);
app.use('/admin', AdminRoute);
app.use('/order', OrderRoute);


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});

mongoose
  .connect(mongoDBURL)
  .then(() => {
    console.log('App connected to database');
    app.listen(PORT, () => {
      console.log(`App is listening to port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
