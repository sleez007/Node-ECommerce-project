const User = require('../model/user');

exports.getLogin = (req, res, next) => {
  //const isLoggedIn= req.get('Cookie').trim().split('=')[1] === 'true';
    console.log(req.session.isLoggedIn)
    res.render('auth/login', {
        path:'/login',
        pageTitle:'Login',
        isAuthenticated : false
    })
}

exports.postLogin = (req, res, next) => {
    const { email, password } = req.body;
    User.findById('5ea04877427f5b3c98e0d11a').then(
        (user)=>{
            //res.setHeader('Set-Cookie', 'loggedIn=true; HttpOnly')
            //the session property is initialized or added by express-session
            req.session.isLoggedIn = true
            req.session.user = user
            //you don't necessary need to call the save method yourself, this only necessary when u want to make sure the session 
            //has been saved before taking a specific action i.e in my case save the session before redirecting
            req.session.save((err)=>res.redirect('/'));
        }
    ).catch(e=> console.log(e))

   
}

exports.postLogout = (req, res, next) =>{
    req.session.destroy((err)=>{
        console.log(err)
        res.redirect('/')
    })
}