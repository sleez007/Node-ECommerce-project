const express = require("express");

const adminController = require("../controllers/admin");
const isAuth = require('../middleware/is-auth')

const router = express.Router();

//full route is /admin/add-product for GET VERB
//YOU CAN ALWAYS PASS AS MANY HANDLERS AS YOU WANT, THEY WILL BE PARSED FROM LEFT TO RIGHT
 router.get('/add-product',isAuth, adminController.getAddProduct);

//full route is /admin/add-product for POST VERB
router.post("/add-product", adminController.postAddProduct);

router.get('/edit-product/:productId',isAuth, adminController.getEditProduct);

router.post('/edit-product',isAuth,adminController.postEditProduct);

router.post("/delete-product",isAuth, adminController.postDeleteProduct)

 router.get('/products',isAuth, adminController.getProducts);

module.exports = router;