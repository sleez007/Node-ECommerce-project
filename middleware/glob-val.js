//THIS METHOD ALLOWS US TO ADD THIS VALUES DIRECTLY INTO EVERY VIEW RENDER METHOD OBJECT.
// module.exports = (req, res, next)=>{
//     console.log(req.session.isLoggedIn, '----')
//     res.locals.isAuthenticated = req.session.isLoggedIn;
//     res.locals.csrfToken  =  req.csrfToken();
//     next();
// }

exports.globVal = (req, res, next)=>{
    res.locals.isAuthenticated = req.session.isLoggedIn;
    next();
}

exports.globCsrf= (req, res, next)=>{
    res.locals.csrfToken  =  req.csrfToken();
    next();
}