const Product = require('../model/product');
const Order = require('../model/order');
const fs = require('fs');
const path = require('path')
const rootDir = require("../util/path");
const PDFDocument = require('pdfkit');
const stripe = require('stripe')('YOUR_STRIPE_SECRET_KEY');

const ITEMS_PER_PAGE = 1;

exports.getProducts = (req,res,next)=>{
    const page = +req.query.page || 1;
    let totalItems = 0;
    Product.find().countDocuments().then(numProducts=>{
        totalItems = numProducts;
        Product.find().skip((page-1)* ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE).then((product)=>{
            res.render("shop/product-list",
            {
                prods: product , 
                pageTitle :'All Products', 
                path:'/products',
                currentPage : page ,
                hasNextPage :ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage : page > 1,
                nextPage : page+1,
                previousPage : page-1,
                lastPage :Math.ceil(totalItems/ ITEMS_PER_PAGE)
            })
            //csurf Token is automatically added to every req, and has to be passed into our views
        })
    })
   .catch(e=>{
        const error = new Error(e)
        error.httpStatusCode = 500
        next(error);
    });
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
    });;
}

exports.getIndex =(req, res, next)=>{
    const page = +req.query.page || 1;
    let totalItems = 0;
    Product.find().countDocuments().then(numProducts=>{
        totalItems = numProducts;
        Product.find().skip((page-1)* ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE).then((product)=>{
            res.render("shop/index",
            {
                prods: product , 
                pageTitle :'Shop', 
                path:'/',
                currentPage : page ,
                hasNextPage :ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage : page > 1,
                nextPage : page+1,
                previousPage : page-1,
                lastPage :Math.ceil(totalItems/ ITEMS_PER_PAGE)
            })
            //csurf Token is automatically added to every req, and has to be passed into our views
        })
    })
   .catch(e=>{
        const error = new Error(e)
        error.httpStatusCode = 500
        next(error);
        console.log(e); res.redirect('/500')
    });
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
    });
}

exports.postOrder = (req, res, next) => {
    const token = req.body.stripeToken; // Using Express
    let totalSum = 0;
    req.user.populate('cart.items.productId').execPopulate().then(user => {
        user.cart.items.forEach(p => {
            totalSum += p.quantity * p.productId.price;
          });
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
        const charge = stripe.charges.create({
            amount: totalSum * 100,
            currency: 'usd',
            description: 'Demo Order',
            source: token,
            metadata: { order_id: result._id.toString() }
          });
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
    req.user.populate('cart.items.productId').execPopulate().then(user => {
        console.log(user.cart.items);
        const products =user.cart.items;
        let total = 0;
        products.forEach(p=>{
            total+= p.quantity*p.productId.price;
        })
        res.render('shop/checkout',
            {path:'/checkout', pageTitle :'Checkout', products : products, totalSum : total }
        );
    }
        
    ).catch(e=>{
        const error = new Error(e)
        error.httpStatusCode = 500
        next(error);
        console.log(e); res.redirect('/500')
    });
}


//invoice downloader
exports.getInvoice = (req, res, next)=>{
    const orderId = req.params.orderId

    Order.findById(orderId).then(order=>{
        if(!order){
            return next(new Error('No order found'))
        }
        if(order.user.userId.toString() !== req.user._id.toString()){
            return next(new Error('Unauthorized'))
        }
        const invoiceName = `invoice-${orderId}.pdf`;
        const invoicePath = path.join(rootDir, '', 'data', 'invoices',invoiceName);
        //READ FILE INTO MEMORY
        // fs.readFile(invoicePath, (err, data)=>{
        //     if(err) return next(err);
        //     res.setHeader('Content-Type', 'application/pdf');
        //     res.setHeader('Content-Disposition', `inline; filename="${invoiceName}"`);
        //     res.send(data)
        // })

        const pdfDoc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${invoiceName}"`);
        pdfDoc.pipe(fs.createWriteStream(invoicePath ));
        pdfDoc.pipe(res)
        pdfDoc.fontSize(26).text('Invoice',{underline: true})
        pdfDoc.text('------------------------------------------------------');
        let totalPrice = 0;
        order.products.forEach(prod => {
            totalPrice+= prod.quantity * prod.product.price
            pdfDoc.fontSize(14).text(`${prod.product.title} - ${prod.quantity} x $${prod.product.price} `)
        });
        pdfDoc.text('-----------------------------------------------------');
        pdfDoc.fontSize(16).text(`Total Price: $${totalPrice}`)
        pdfDoc.end()

        //STREAM FILE TO BROWSER
        // const file = fs.createReadStream(invoicePath);
        // res.setHeader('Content-Type', 'application/pdf');
        // res.setHeader('Content-Disposition', `inline; filename="${invoiceName}"`);
        // file.pipe(res)
    }).catch(e=>{
        const error = new Error(e)
        error.httpStatusCode = 500
        next(error);
        console.log(e); res.redirect('/500')
    });
}


