const express = require("express");

const adminController = require("../controllers/admin");

const router = express.Router();

//full route is /admin/add-product for GET VERB
 router.get('/add-product',adminController.getAddProduct);

//full route is /admin/add-product for POST VERB
router.post("/add-product", adminController.postAddProduct);

router.get('/edit-product/:productId', adminController.getEditProduct);

router.post('/edit-product',adminController.postEditProduct);

router.post("/delete-product", adminController.postDeleteProduct)

 router.get('/products', adminController.getProducts);

module.exports = router;