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
        //console.log(req.user);
        //console.log(res.locals.currentUser);
        res.render('index', { title: 'Message List', message_list: message_list, user: req.user });
    });
    //res.render('index', { title: 'Express' });
});


//-----------------------

//Sign-Up GET route 
router.get("/sign-up", (req, res) => res.render("sign-up-form"));

//Sign-Up POST route
router.post("/sign-up",

    // VALIDATION AND SANITIZATION. This validation is happening in the front end (html) aswel. I'll leave this as for now, because I might change it.
    body('username').trim().escape().isLength({ min: 5, max: 16 }).withMessage("Username must have between 5 to 16 characters"),

    body('password').isLength({ min: 5, max: 16 }).escape().withMessage('Password must be between 5 to 16 characters'),
    body('email').isEmail().withMessage("E-mail must have the format example@mail.com"),

    // Password confirmation validation
    body('passwordConfirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        }
        //TODO poner las validaciones en otro lugar asi queda mejor el codigo
        // Indicates the success of this synchronous custom validator
        return true;
    }).escape(),

    body('username').custom(value => {
        return User.findOne({ username: value }).then(user => {

            if (user) {
                return Promise.reject('User already in use');
            }
        });
    }),
    //TODO hay algo mal en la forma en que manejas los errores que se imprimen en pantalla, onda que te manda todos los errores a imprimir, inclusive eso que son internos y que el suario no deberia saber, como por ejemplo "Cannot read property 'username' of null"
    //TODO revisar ese error de que al desloguearte no lo maneja como corresponde y tira error en vez de redigirigir, por eje,plo cuando queres hacerun mensaje nuevo y te deslogues en el medio. Lo ideal seria comprobar si estas logueado mirando la cookie o el req, como lo que te paso el pibe este
    body('email').custom(value => {
        return User.findOne({ email: value }).then(user => {

            if (user) {
                return Promise.reject('E-mail already in use');
            }
        });
    }),


    (req, res, next) => {

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
router.post("/create-new-message",


    body('tittle').trim().escape().isLength({ min: 3, max: 50 }).withMessage("Tittle must have between 3 to 50 characters"),
    body('messageText').trim().escape().isLength({ min: 3, max: 4000 }).withMessage("Message must have between 3 to 4000 characters"),

    (req, res, next) => {

        var newMessage = new Message({
            tittle: req.body.tittle,
            messageText: req.body.messageText,
            author: req.user.username

        });

        const errors = validationResult(req);
        if (!errors.isEmpty()) {

            return res.render("message-form", { errors: errors.array() });
        }


        newMessage.save(function(err) {
            if (err) { return next(err); }
            //successful - redirect to new book record.
            res.redirect("/");
        });
    })


//-----------------------
// Delete message
router.get("/message/:id/delete", (req, res) => {

    Message.findById(req.params.id).
    exec(function(err, message) {
        if (err) { return next(err); }
        // Successful, so render

        res.render('message-delete-form', { title: 'Delete Message', message: message });
    })
})


router.post("/message/:id/delete", (req, res) => {
    //TODO borrar los console log
    Message.findByIdAndRemove(req.params.id).
    exec(function(err) {
        if (err) { return next(err); }
        // Successful, so render

        res.redirect("/");
    })
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