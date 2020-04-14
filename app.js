const path = require('path');

const express = require('express');
const bodyParser = require("body-parser");
//const expressHbs = require("express-handlebars"); 

const adminRoutes = require('./routes/admin');
 const shopRoutes = require("./routes/shop");

const mongoConnect= require('./util/database').mongoConnect;

const errorController = require('./controllers/error');

//MODELS
const User = require("./model/user")



const app = express();


/**
 * APP ENGINE METHOD IS USED TO INFORM EXPRESS OF AN ENGINE THAT IS NOT AUTO 
 * INSTALLED ON EXPRESS. This is not necessary when using pug
 */
//app.engine('.hbs',expressHbs({layoutsDir: 'views/layouts', defaultLayout:'main-layout', extname: '.hbs'}));

//TELL EXPRESS WHICH VIEW ENGINE YOU WANT TO USE
// view engine is a defined constant in express
//app.set("view engine", "pug");
app.set("view engine", "ejs");

//let express know where to find our views
//BY DEFAULT THE VIEW FOLDER IS Set, WE CAN SKIP DOING THIS
app.set("views" , "views");

app.use(bodyParser.urlencoded({extended: false}));

//specify a folder express grants read access to from outside the app
//This folder allows serving of static files like css and images
app.use(express.static(path.join(__dirname,"public")))

app.use((req,res,next)=>{
    User.findById("5e9381fd574842e36d5a563b").then(user=>{
        //adding our user to the request object
        req.user = new User(user.name,user.email,user.cart, user._id );
        next();
    }).catch(e=>console.log(e))
});

app.use('/admin',adminRoutes);
 app.use(shopRoutes);

//404 route page
app.use('/',errorController.get404);

mongoConnect(()=>{
    User.findById("5e9381fd574842e36d5a563b").then(user=>{
        if(user){
            return Promise.resolve(user);
        }else{
            return new User("sleez360", "etokakingsley@gmail.com",{items:[]}).save()
        }
    })
    .then(userData=>{
        app.listen(process.env.port || 3000);
    })
    .catch(e=>console.log(e))
   
})


//app.listen( process.env.port || 3000);