const express = require('express');
const productRouter = express.Router();

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');
const { upload } = require('../utils/cloudinary');
const { createProduct, updateProduct, deleteProduct, getProducts, getSingleProduct } = require('../controller/product/productController');

productRouter.get('/products', getProducts);
productRouter.get('/product/:id', getSingleProduct);

productRouter.post(
    '/addProduct', 
    isAuthenticatedUser, 
    authorizeRoles('vendor'), 
    upload.single('image'),
    createProduct
);

productRouter.route('/deleteProduct/:id')
    .put(isAuthenticatedUser, authorizeRoles('vendor'),upload.single('image'), updateProduct)
    .delete(isAuthenticatedUser, authorizeRoles('vendor'), deleteProduct);

module.exports = productRouter;