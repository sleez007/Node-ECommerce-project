const path = require("path");

const express = require("express");

const shopController = require("../controllers/shop");

//const rootDir = require("../util/path");
//const adminRoutes = require('./admin');


const router = express.Router();

router.get('/',shopController.getIndex);

router.get('/products',shopController.getProducts);

router.get('/products/:productId',shopController.getProduct);

// router.get('/orders', shopController.getOrders);

 router.get('/cart',shopController.getCart);

 router.post("/cart-delete-item", shopController.postCartDeleteProduct)

 router.post('/cart', shopController.postCart)

// router.post('/create-order', shopController.postOrder)

// router.get('/checkout', shopController.getCheckout);

module.exports = router;