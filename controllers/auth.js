const User = require('../model/user');
const bcrypt = require('bcryptjs');
const nodemailer =  require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport');

//crypto is built into node so it's not a third party
const crypto = require('crypto')

const transporter = nodemailer.createTransport(sendgridTransport({
    auth:{
        api_key: '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'
    }
}))

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
                var emailInfo = {
                    to: [email],
                    from: 'etokakingsley@gmail.com',
                    subject: 'Hi there',
                    html: '<h1>You signed up successfully</h1>'
                };
                res.redirect('/login')
                return transporter.sendMail(emailInfo)
            }
         ).then(stat=>{console.log(stat)}).catch(e=>console.log(e));
        
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

exports.getReset = (req, res, next) =>{
    let message = req.flash('error');
    if(message.length > 0){
        message = message[0];
    }else{
        message = null;
    }
    res.render('auth/reset', {
        path:'/reset',
        pageTitle:'Reset Password',
        errorMessage : message
    })
}

exports.postReset = (req, res, next) =>{
    crypto.randomBytes(32,(err, buffer)=>{
        if(err){
            console.log(err);
            return res.redirect('/reset')
        }
        const token = buffer.toString('hex')
        User.findOne({email : req.body.email}).then(
            user=>{
                if(!user){
                    req.flash('error','The email provided doesn\'t exist!')
                    return res.redirect('/reset')
                }
                user.resetToken = token;
                user.tokenExpiration = Date.now()+ 3600000;
                user.save().then(
                    result =>{
                        var emailInfo = {
                            to: [req.body.email],
                            from: 'etokakingsley@gmail.com',
                            subject: 'Password reset',
                            html: `
                                <p>You requested for a password reset</p>
                                <P>Click this <a href='http://localhost:3000/reset/${token}'>link</a> to reset your password </P>

                            `
                        };
                        res.redirect('/');
                        console.log("bjvjh")
                        return transporter.sendMail(emailInfo);
                    }
                ).catch(e=>console.log(e));
            }
        ).catch(e=>console.log(e))
    })

    
}

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token
    User.findOne({resetToken : token, tokenExpiration : {$gt: Date.now()}}).then(
        user=>{
            if(user){
                let message = req.flash('error');
                if(message.length > 0){
                    message = message[0];
                }else{
                    message = null;
                }
                res.render('auth/new-password', {
                    path:'/new-password',
                    pageTitle:'New Password',
                    errorMessage : message,
                    userId : user._id.toString(),
                    passwordToken: token
                })
            }else{
                req.flash('error','The token may have gone off or the email doesn\'t exist! ')
                res.redirect('/')
            }
        }
    ).catch(e=>console.log(e))
};

exports.postNewPassword = (req, res, next) =>{
    const { password , userId, passwordToken } = req.body;
    User.findOne({resetToken: passwordToken, tokenExpiration :{$gt: Date.now()}, _id : userId }).then(user=>{
        if(user){
            return bcrypt.hash(password, 12).then(
                hashedPwd=>{
                    user.password = hashedPwd;
                    user.resetToken = null;
                    user.tokenExpiration = undefined
                    return user.save(); 
                }
            ).then(svdRes=> res.redirect('login')).catch(e=>console.log(e))
        }
    }).catch(e=>console.log(e))
}