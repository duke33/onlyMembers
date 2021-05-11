var express = require('express');
var router = express.Router();
var User = require('../models/user');
const passport = require("passport");
const bcrypt = require("bcryptjs");
var Message = require('../models/message');
var flash = require('connect-flash');
const { body, validationResult } = require('express-validator');
const { check } = require('express-validator');

/* GET home page. */
router.get('/', function(req, res, next) {

    Message.find().sort({ timestamp: -1 }).
    exec(function(err, message_list) {
        if (err) { return next(err); }
        // Successful, so render
        console.log(req.user);
        console.log(res.locals.currentUser);
        res.render('index', { title: 'Message List', message_list: message_list, user: req.user });
    });
    //res.render('index', { title: 'Express' });
});


//-----------------------

//Sign-Up GET route 
router.get("/sign-up", (req, res) => res.render("sign-up-form"));

//Sign-Up POST route
router.post("/sign-up",
    //TODO Cuando falle la validacion, volver a popular los campos que esten bien asi no aparece vacio todo
    // VALIDATION AND SANITIZATION. This validation is happening in the front end (html) aswel. I'll leave this as for now, because I might change it.
    body('username').trim().escape().isLength({ min: 5 }).withMessage("Username must have at least 5 characters"),

    body('password').isLength({ min: 5, max: 16 }).escape().withMessage('Password must be between 5 to 16 characters'),
    body('email').isEmail().withMessage("E-mail must have the format example@mail.com"),

    // Password confirmation validation
    body('passwordConfirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        }

        // Indicates the success of this synchronous custom validator
        return true;
    }).escape().bail(),




    body('username').custom(value => {
        return User.findOne({ username: value }).then(user => {

            if (user) {
                return Promise.reject('User already in use');
            }
        });
    }).bail(),
    //TODO hay algo mal en la forma en que manejas los errores que se imprimen en pantalla, onda que te manda todos los errores a imprimir, inclusive eso que son internos y que el suario no deberia saber, como por ejemplo "Cannot read property 'username' of null"

    body('email').custom(value => {
        return User.findOne({ email: value }).then(user => {

            if (user) {
                return Promise.reject('E-mail already in use');
            }
        });
    }).bail(),


    (req, res, next) => { //TODO add bail to validation

        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {

            return res.render("sign-up-form", { errors: errors.array() });
        }

        //La parte de manejar el hasheo
        bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
            // if err, do something
            if (err) {
                return next(err);
            }
            // otherwise, store hashedPassword in DB
            // eslint-disable-next-line no-unused-vars
            const user = new User({
                username: req.body.username,
                password: hashedPassword,
                email: req.body.email
            }).save(err => {
                if (err) {
                    return next(err);
                }
                return res.redirect("/log-in");
            });
        });
    });

//-----------------------

// Log-in GET route
router.get("/log-in", (req, res) => res.render("log-in-form", { user: req.user }));

// Log-in POST route
router.post(
    "/log-in",
    passport.authenticate("local", {
        failureFlash: false,
        successRedirect: "/",
        failureRedirect: "/log-in"

    })
);

//-----------------------

//Log-out
router.get("/log-out", (req, res) => {
    req.logout();

    res.redirect("/");
});

//-----------------------

// New message
router.get("/create-new-message", (req, res) => res.render("message-form"))
router.post("/create-new-message", (req, res, next) => {
    var newMessage = new Message({
        tittle: req.body.tittle,
        messageText: req.body.messageText,
        author: req.user.username

    });
    console.log("req.user " + req.user);
    console.log(res.locals.currentUser);
    newMessage.save(function(err) {
        if (err) { return next(err); }
        //successful - redirect to new book record.
        res.redirect("/");
    });
})


//-----------------------

// //Flash Message
// router.get('/flash', function(req, res) {
//     // Set a flash message by passing the key, followed by the value, to req.flash().
//     req.flash('info', 'Flash is back!')
//     res.redirect('/');
// });
//-----------------------
module.exports = router;