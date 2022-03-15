import express from 'express';
import mongoose from 'mongoose';
import expressAsyncHandler from 'express-async-handler';
import { isAuth, isAdmin } from '../utils';
import Product from '../models/productModel';
import Order from '../models/orderModel';

const productRouter = express.Router();

productRouter.get(
  '/',
  expressAsyncHandler(async (req, res) => {
    const searchKeyword = req.query.searchKeyword
      ? {
          name: {
            $regex: req.query.searchKeyword,
            $options: 'i',
          },
        }
      : {};

    const products = await Product.find({ ...searchKeyword });
    res.send(products);
  })
);

productRouter.get(
  '/:id',
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.send(product);
  })
);

productRouter.post(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const product = new Product({
      name: 'sample product',
      description: 'sample desc',
      category: 'sample category',
      brand: 'sample brand',
      image: '/images/product-1.jpg',
    });
    const createdProduct = await product.save();
    if (createdProduct) {
      res
        .status(201)
        .send({ message: 'Product Created', product: createdProduct });
    } else {
      res.status(500).send({ message: 'Error in creating product' });
    }
  })
);

productRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (product) {
      product.name = req.body.name;
      product.price = req.body.price;
      product.image = req.body.image;
      product.brand = req.body.brand;
      product.category = req.body.category;
      product.countInStock = req.body.countInStock;
      product.description = req.body.description;

      const updatedProduct = await product.save();
      if (updatedProduct) {
        res
          .status(200)
          .send({ message: 'Product updated', product: updatedProduct });
      } else {
        res.status(500).send({ message: 'Error in updating product' });
      }
    } else {
      res.status(404).send({ message: 'Product not Found' });
    }
  })
);

productRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      const deletedProduct = await product.remove();
      res.send({ message: 'Product deleted', product: deletedProduct });
    } else {
      res.status(404).send({ message: 'Product not Found' });
    }
  })
);

productRouter.post(
  '/:id/reviews',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
      const review = {
        rating: req.body.rating,
        comment: req.body.comment,
        user: req.user._id,
        name: req.user.name,
      };
      product.reviews.push(review);
      product.rating =
        product.reviews.reduce((acc, cur) => cur.rating + acc, 0) /
        product.reviews.length;
      product.numReviews = product.reviews.length;

      const orders = await Order.aggregate([
        { $match: { user: mongoose.Types.ObjectId(req.user._id) } },
        { $unwind: '$orderItems' },
        {
          $match: {
            'orderItems.product': mongoose.Types.ObjectId(req.params.id),
          },
        },
      ]);

      let updatedProduct;
      if (orders.length !== 0) {
        updatedProduct = await product.save();
      } else {
        throw new Error('You must buy the product to be able to review it!');
      }

      const reviews = await Product.aggregate([
        {
          $match: {
            'reviews.user': mongoose.Types.ObjectId(req.user._id),
          },
        },
      ]);

      if (reviews.length !== 0) {
        throw new Error('You already reviewed this product!');
      }

      res.status(201).send({
        message: 'Comment Created',
        data: updatedProduct.reviews[updatedProduct.reviews.length - 1],
      });
    } else {
      throw new Error('Prodcut does not exist');
    }
  })
);

export default productRouter;
