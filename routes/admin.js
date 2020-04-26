const express = require("express");
const { check, body } = require('express-validator');

const adminController = require("../controllers/admin");
const isAuth = require('../middleware/is-auth')

const router = express.Router();

//full route is /admin/add-product for GET VERB
//YOU CAN ALWAYS PASS AS MANY HANDLERS AS YOU WANT, THEY WILL BE PARSED FROM LEFT TO RIGHT
 router.get('/add-product',isAuth, adminController.getAddProduct);

//full route is /admin/add-product for POST VERB
router.post("/add-product",isAuth,
    [
        body('title').isString().isLength({min: 3}).trim(),
        body('price').isFloat(),
        body('description').trim().isLength({min: 5, max: 500})
    ], adminController.postAddProduct
);

router.get('/edit-product/:productId',isAuth, adminController.getEditProduct);

router.post('/edit-product',isAuth,
    [
        body('title').isString().isLength({min: 3}).trim(),
        body('price').isFloat(),
        body('description').trim().isLength({min: 5, max: 500})
    ],
    adminController.postEditProduct
);

router.post("/delete-product",isAuth, adminController.postDeleteProduct)

 router.get('/products',isAuth, adminController.getProducts);

module.exports = router;

