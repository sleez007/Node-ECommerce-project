const User = require('../model/user');

exports.isEmailExistingCb = (value,{req})=>{
    return User.findOne({email : value}).then(userDoc=>{
         if(userDoc){
             return Promise.reject('Email exists already, Please pick a different one.')
         }
     })
 }

exports.doesPasswordsMatchCb = (val, { req }) => {
    if(val !== req.body.password){
        throw new Error('Passwords have to match');
    }
    return true;
}