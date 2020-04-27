const path = require('path');

const express = require('express');
const bodyParser = require("body-parser");
const mongoose =  require('mongoose');
const session = require('express-session');
const MongoDbSessionStore  = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const { fileStorage, fileFilter } = require('./middleware/multer-config');

const shopController = require('./controllers/shop');
const isAuth = require('./middleware/is-auth');

const globVal = require('./middleware/glob-val');
const adminRoutes = require('./routes/admin');
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

const errorController = require('./controllers/error');

//MODELS
const User = require('./model/user')

const dbConnStr = 'mongodb://localhost/e-store'
//const dbConnStr= 'mongodb+srv://sleez:sleez@cluster0-a0fnl.mongodb.net/test?retryWrites=true&w=majority'



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
app.use(multer({storage : fileStorage, fileFilter : fileFilter}).single('image'));

//specify a folder express grants read access to from outside the app
//This folder allows serving of static files like css and images
app.use(express.static(path.join(__dirname,'public')))
app.use('/images',express.static(path.join(__dirname,'images')))

//initialize express session
app.use(session({secret: 'my whatever secret', resave : false, saveUninitialized : false, store: sessionStore}));


app.use(flash());

app.use((req,res,next)=>{
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
    .then(user => {
        if(!user){
           return next();
        }
      req.user = user;
      next();
    })
    .catch(err =>{ 
        throw new Error(err);
    });
});

//adding global properties to our render objects for views
app.use(globVal.globVal);

//this route skips csrf protection becos it was added before csrf
app.post('/create-order',isAuth, shopController.postOrder);

//register csurf protection
app.use(csrfProtection);
app.use(globVal.globCsrf);

app.use('/admin',adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500',errorController.get500)
app.use(errorController.get404);

//ERROR HANDLING MIDDLEWARE
app.use((error,req, res, next)=>{
    res.status(error.httpStatusCode).redirect('/500');
})

mongoose.connect(dbConnStr, {useNewUrlParser: true, useUnifiedTopology: true})
.then(
    result => app.listen(process.env.port || 3000)
).catch(
    e=>console.log(e)
)


