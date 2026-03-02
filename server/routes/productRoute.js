const express = require('express');
const productRouter = express.Router();
const { 
    getProducts, 
    getSingleProduct, 
    createProduct, 
    updateProduct, 
    deleteProduct 
} = require('../controller/product/productController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

productRouter.get('/products', getProducts);
productRouter.get('/product/:id', getSingleProduct);

productRouter.post(
    '/addProduct', 
    isAuthenticatedUser, 
    authorizeRoles('vendor'), 
    createProduct
);

productRouter.route('/deleteProduct/:id')
    .put(isAuthenticatedUser, authorizeRoles('vendor'), updateProduct)
    .delete(isAuthenticatedUser, authorizeRoles('vendor'), deleteProduct);

module.exports = productRouter;