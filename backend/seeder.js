import mongoose from 'mongoose';
import data from './data';
import config from './config';
import Product from './models/productModel';
import User from './models/userModel';

mongoose
  .connect(config.MONGODB_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log(err.reason));

export const importData = async () => {
  try {
    await Product.deleteMany({});
    await User.deleteMany({});

    await Product.insertMany(data.products);
    await User.insertMany(data.users);
  } catch (err) {
    console.log(err);
  }
};
