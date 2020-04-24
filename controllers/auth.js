const User = require('../model/user');
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if(message.length > 0){
      message = message[0];
  }else{
      message = null;
  }
    console.log(req.session.isLoggedIn)
    res.render('auth/login', {
        path:'/login',
        pageTitle:'Login',
        errorMessage: message
    })
}

exports.postLogin = (req, res, next) => {
    const { email, password } = req.body;
    
    User.findOne({email : email}).then(
        (user)=>{

            if(!user){
                req.flash('error', 'Invalid email/password')
                return res.redirect('/login');
            }
            bcrypt.compare(password,user.password).then(
                isCorrect => {
                    if(isCorrect){
                        //res.setHeader('Set-Cookie', 'loggedIn=true; HttpOnly')
                        //the session property is initialized or added by express-session
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        //you don't necessary need to call the save method yourself, this only necessary when u want to make sure the session 
                        //has been saved before taking a specific action i.e in my case save the session before redirecting
                        req.session.save((err)=>res.redirect('/'));
                    }else{
                        req.flash('error', 'Invalid email/password');
                        res.redirect('/login')
                    }
                }
            ).catch(e=> console.log(e))
            
        }
    ).catch(e=> console.log(e));
}

exports.postSignup = (req, res, next) => {
  const {email, password, confirmPassword} = req.body;
  //keep in mind we can do this with indexing
  User.findOne({email : email}).then(
    userDoc => { 
        if(userDoc){
            req.flash('error', 'Email exists already, Please pick a different one!')
            return res.redirect('/signup');
        }
        bcrypt.hash(password, 12).then(hashedPassword =>{
            return new User({email: email, password: hashedPassword, cart :{items : [] } }).save()
        }).then(
            
            result=> {
                res.redirect('/login')
            }
         ).catch(e=>console.log(e));
        
    }
  ).catch(e=>console.log(e))
};

exports.getSignup = (req, res, next) =>{
    let message = req.flash('error');
  if(message.length > 0){
      message = message[0];
  }else{
      message = null;
  }
    res.render('auth/signup', {
        path:'/signup',
        pageTitle:'Signup',
        errorMessage : message
    })
}

exports.postLogout = (req, res, next) =>{
    req.session.destroy((err)=>{
        console.log(err);
        res.redirect('/');
    })
}