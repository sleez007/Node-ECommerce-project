const Product = require('../model/product');

exports.getProducts = (req,res,next)=>{
    Product.fetchAll().then((product)=>{
        res.render("shop/product-list",
         {
            prods: product , 
            pageTitle :'All Products', 
            path:'/products', 
        })
    }).catch(err=>console.log(err))
}

exports.getProduct = (req, res, next )=>{
     const prodId = req.params.productId
     Product.findById(prodId).then( 
        (product)=>{
           res.render('shop/product-detail',{path:'/products', pageTitle:product.title, product: product })
        }
    ).catch(e=>console.log(e));
}

exports.getIndex =(req, res, next)=>{
    Product.fetchAll().then((product)=>{
        res.render("shop/index",
        {
           prods: product , 
           pageTitle :'Shop', 
           path:'/',  
       })
    }).catch(err=>console.log(err));
}

exports.getCart = (req, res, next) => {
    req.user.getCart().then(products => 
        res.render('shop/cart',{path:'/cart', pageTitle :'Your Cart', products : products })
    ).catch(e=>console.log(e))
}

//ADD NEW ITEM TO CART/ OR UPDATE EXISTING ITEM
exports.postCart = (req, res, next)=> {
     const prodId = req.body.productId;
    Product.findById(prodId).then(prod =>req.user.addToCart(prod))
    .then(result=>res.redirect('/cart'))
    .catch(e=>console.log(e));
}

exports.postCartDeleteProduct = (req,res,next)=>{
    const prodId = req.body.productId;
    req.user.deleteItemFromCart(prodId) 
    .then(result=>res.redirect('/cart'))
    .catch(e=>console.log(e))
}

exports.postOrder = (req, res, next) => {
    let fetchedCart;
     req.user.getCart()
     .then(cart=> {
         fetchedCart = cart;
         return  cart.getProducts()
        }
    )
     .then(products=>req.user.createOrder().then(order => {
        order.addProducts(products.map(product =>{
            product.orderItem = {quantity: product.cartItem.quantity}
            return product
        }))
     }).catch(e=>console.log(e)))
     .then(result=>fetchedCart.setProducts(null))
     .then(result=>res.redirect('/orders'))
     .catch(e=>console.log(e))
}

exports.getOrders= (req, res, next) => {
    req.user.getOrders({include : ['products']})
    .then(orders=>res.render('shop/orders',{path:'/orders', pageTitle :'Your Orders',orders : orders})).catch(e=>console.log(e))
    ;
}

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path:'/checkout',
        pageTitle:'Checkout'
    })
}

