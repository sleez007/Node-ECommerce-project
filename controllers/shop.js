const Product = require('../model/product');
const Order = require('../model/order');

exports.getProducts = (req,res,next)=>{
    Product.find().then((product)=>{
        res.render("shop/product-list",
         {
            prods: product , 
            pageTitle :'All Products', 
            path:'/products' 
        })
    }).catch(err=>console.log(err))
}

exports.getProduct = (req, res, next )=>{
     const prodId = req.params.productId
     Product.findById(prodId).then( 
        (product)=>{
           res.render('shop/product-detail',{path:'/products', pageTitle:product.title, product: product  })
        }
    ).catch(e=>{
        const error = new Error(e)
        error.httpStatusCode = 500
        next(error);
        console.log(e); res.redirect('/500')
    });;
}

exports.getIndex =(req, res, next)=>{
    Product.find().then((product)=>{
        res.render("shop/index",
        {
           prods: product , 
           pageTitle :'Shop', 
           path:'/',  
       })
       //csurf Token is automatically added to every req, and has to be passed into our views
    }).catch(e=>{
        const error = new Error(e)
        error.httpStatusCode = 500
        next(error);
        console.log(e); res.redirect('/500')
    });;
}

exports.getCart = (req, res, next) => {
    req.user.populate('cart.items.productId').execPopulate().then(user => {
        console.log(user.cart.items);
        const products =user.cart.items;
        res.render('shop/cart',{path:'/cart', pageTitle :'Your Cart', products : products });
    }
        
    ).catch(e=>{
        const error = new Error(e)
        error.httpStatusCode = 500
        next(error);
        console.log(e); res.redirect('/500')
    });
}

//ADD NEW ITEM TO CART/ OR UPDATE EXISTING ITEM
exports.postCart = (req, res, next)=> {
     const prodId = req.body.productId;
    Product.findById(prodId).then(prod =>req.user.addToCart(prod))
    .then(result=>res.redirect('/cart'))
    .catch(e=>{
        const error = new Error(e)
        error.httpStatusCode = 500
        next(error);
        console.log(e); res.redirect('/500')
    });;
}

exports.postCartDeleteProduct = (req,res,next)=>{
    const prodId = req.body.productId;
    req.user.removeFromCart(prodId) 
    .then(result=>res.redirect('/cart'))
    .catch(e=>{
        const error = new Error(e)
        error.httpStatusCode = 500
        next(error);
        console.log(e); res.redirect('/500')
    });
}

exports.postOrder = (req, res, next) => {
    req.user.populate('cart.items.productId').execPopulate().then(user => {
       
        const products = user.cart.items.map(i=>({quantity : i.quantity, product: {...i.productId._doc}}));
        const order = new Order({
            user : {
                email : req.user.email ,
                userId : req.user._id
            },
            products : products
        });
       return order.save();
    }).then(result=>{
        return req.user.clearCart()
        
    }).then(result=>res.redirect('/orders')).catch(e=>{
        const error = new Error(e)
        error.httpStatusCode = 500
        next(error);
        console.log(e); res.redirect('/500')
    });;
}

exports.getOrders= (req, res, next) => {
    Order.find({'user.userId': req.user._id})
    .then(orders=>res.render('shop/orders',{path:'/orders', pageTitle :'Your Orders',orders : orders}))
    .catch(e=>{
        const error = new Error(e)
        error.httpStatusCode = 500
        next(error);
        console.log(e); res.redirect('/500')
    });
}

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path:'/checkout',
        pageTitle:'Checkout'
    })
}

