const Product = require('../model/product');
const Order = require('../model/order');

exports.getProducts = (req,res,next)=>{
    Product.find().then((product)=>{
        res.render("shop/product-list",
         {
            prods: product , 
            pageTitle :'All Products', 
            path:'/products', 
            isAuthenticated : req.session.isLoggedIn  
        })
    }).catch(err=>console.log(err))
}

exports.getProduct = (req, res, next )=>{
     const prodId = req.params.productId
     Product.findById(prodId).then( 
        (product)=>{
           res.render('shop/product-detail',{path:'/products', pageTitle:product.title, product: product,  isAuthenticated : req.session.isLoggedIn   })
        }
    ).catch(e=>console.log(e));
}

exports.getIndex =(req, res, next)=>{
    Product.find().then((product)=>{
        res.render("shop/index",
        {
           prods: product , 
           pageTitle :'Shop', 
           path:'/',  
           isAuthenticated : req.session.isLoggedIn  
       })
    }).catch(err=>console.log(err));
}

exports.getCart = (req, res, next) => {
    req.user.populate('cart.items.productId').execPopulate().then(user => {
        console.log(user.cart.items);
        const products =user.cart.items;
        res.render('shop/cart',{path:'/cart', pageTitle :'Your Cart', isAuthenticated : req.session.isLoggedIn  , products : products });
    }
        
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
    req.user.removeFromCart(prodId) 
    .then(result=>res.redirect('/cart'))
    .catch(e=>console.log(e))
}

exports.postOrder = (req, res, next) => {
    req.user.populate('cart.items.productId').execPopulate().then(user => {
       
        const products = user.cart.items.map(i=>({quantity : i.quantity, product: {...i.productId._doc}}));
        const order = new Order({
            user : {
                name : req.user.name ,
                userId : req.user._id
            },
            products : products
        });
       return order.save();
    }).then(result=>{
        return req.user.clearCart()
        
    }).then(result=>res.redirect('/orders')).catch(e=>console.log(e));
}

exports.getOrders= (req, res, next) => {
    Order.find({'user.userId': req.user._id})
    .then(orders=>res.render('shop/orders',{path:'/orders', isAuthenticated : req.session.isLoggedIn  , pageTitle :'Your Orders',orders : orders})).catch(e=>console.log(e))
    ;
}

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path:'/checkout',
        pageTitle:'Checkout',
        isAuthenticated : req.session.isLoggedIn  
    })
}

