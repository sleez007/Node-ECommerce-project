const express = require('express')
const router = express.Router();
const authController = require('../controllers/auth')
const { check, body } = require('express-validator');
const { isEmailExistingCb, doesPasswordsMatchCb} = require('../middleware/auth-helper')

router.get('/login',authController.getLogin );
router.post('/login',
    [
        check('email').isEmail().withMessage("Please enter a valid email").normalizeEmail(),
        body('password','Please enter a password with only numbers and text and at least 5 characters').isLength({min: 5,max: 200}).isAlphanumeric().trim()
    ], 
    authController.postLogin);
router.post('/logout',authController.postLogout);

router.get('/signup', authController.getSignup);
router.post('/signup',
    [
        check('email').isEmail().withMessage("Please enter a valid email").custom(isEmailExistingCb).normalizeEmail(),
        body('password','Please enter a password with only numbers and text and at least 5 characters').isLength({min: 5,max: 200}).isAlphanumeric().trim(),
        body('confirmPassword').trim().custom(doesPasswordsMatchCb)
    ],
    authController.postSignup
 );

router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword)

module.exports = router;