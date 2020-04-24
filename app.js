const path = require('path');

const express = require('express');
const bodyParser = require("body-parser");
const mongoose =  require('mongoose');
const session = require('express-session');
const MongoDbSessionStore  = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const globVal = require('./middleware/glob-val');
const adminRoutes = require('./routes/admin');
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

const errorController = require('./controllers/error');

//MODELS
const User = require('./model/user')

const dbConnStr = 'mongodb://localhost/e-store'



const app = express();
const sessionStore = new MongoDbSessionStore({uri : dbConnStr, collection : 'sessions'})

//YOU CAN PASS IN AN OBJECT TO CONFIGURE CSRF 
const csrfProtection = csrf()


/**
 * APP ENGINE METHOD IS USED TO INFORM EXPRESS OF AN ENGINE THAT IS NOT AUTO 
 * INSTALLED ON EXPRESS. This is not necessary when using pug
 */
//app.engine('.hbs',expressHbs({layoutsDir: 'views/layouts', defaultLayout:'main-layout', extname: '.hbs'}));

//TELL EXPRESS WHICH VIEW ENGINE YOU WANT TO USE
// view engine is a defined constant in express
//app.set("view engine", "pug");
app.set('view engine', 'ejs');

//let express know where to find our views
//BY DEFAULT THE VIEW FOLDER IS Set, WE CAN SKIP DOING THIS
app.set('views' , 'views');

app.use(bodyParser.urlencoded({extended: false}));

//specify a folder express grants read access to from outside the app
//This folder allows serving of static files like css and images
app.use(express.static(path.join(__dirname,'public')))

//initialize express session
app.use(session({secret: 'my whatever secret', resave : false, saveUninitialized : false, store: sessionStore}));

//register csurf protection
app.use(csrfProtection);
app.use(flash());

app.use((req,res,next)=>{
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

//adding global properties to our render objects for views
app.use(globVal);

app.use('/admin',adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use('/',errorController.get404);

mongoose.connect(dbConnStr, {useNewUrlParser: true, useUnifiedTopology: true})
.then(
    
    result => {
        User.findOne().then(
            result => {
                app.listen(process.env.port || 3000);
            }
        ).
       catch(e=>console.log(e))
        
    }
).catch(
    e=>console.log(e)
)


