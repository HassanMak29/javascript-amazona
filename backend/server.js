import express from 'express';
import path from 'path';
import cors from 'cors';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
// import data from './data';
import config from './config';
import userRouter from './routers/userRouter';
import orderRouter from './routers/orderRouter';
import productRouter from './routers/productRouter';
import uploadRouter from './routers/uploadRouter';
import { importData } from './seeder';

mongoose
  .connect(config.MONGODB_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log(err.reason));

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/uploads', uploadRouter);
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);
app.get('/api/paypal/clientId', (req, res) => {
  res.send({ clientId: config.PAYPAL_CLIENT_ID });
});
// app.get('/api/products', (req, res) => {
//   res.send(data.products);
// });

// app.get('/api/products/:id', (req, res) => {
//   const product = data.products.find((x) => x._id === req.params.id);
//   if (product) {
//     res.send(product);
//   } else {
//     res.status(404).send({ message: 'Product not found' });
//   }
// });

app.use('/uploads', express.static(path.join(__dirname, '/../uploads')));
app.use(express.static(path.join(__dirname, '/../frontend')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/../frontend/index.html'));
});

app.use((err, req, res, next) => {
  const status = err.name && err.name === 'ValidationError' ? 400 : 500;
  res.status(status).send({ message: err.message });
});

//////////// Seeder //////////////
// importData();
//////////////////////////////////

app.listen(config.PORT, () => {
  console.log(`Serve at http://localhost:${config.PORT}`);
});
