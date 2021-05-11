var express = require('express');
var router = express.Router();
var User = require('../models/user');
const passport = require("passport");
const bcrypt = require("bcryptjs");
var Message = require('../models/message');
var flash = require('connect-flash');

/* GET home page. */
router.get('/', function(req, res, next) {

    Message.find().
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
router.post("/sign-up", (req, res, next) => {
    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
        // if err, do something
        if (err) {
            return next(err);
        }
        // otherwise, store hashedPassword in DB
        // eslint-disable-next-line no-unused-vars
        const user = new User({
            username: req.body.username,
            password: hashedPassword
        }).save(err => {
            if (err) {
                return next(err);
            }
            return res.redirect("/");
        });
    });
});

//-----------------------

// Log-in GET route
router.get("/log-in", (req, res) => res.render("log-in-form", { user: req.user } /*, { message: req.flash('error') }*/ ));

// Log-in POST route
router.post(
    "/log-in",
    passport.authenticate("local", {
        failureFlash: true,
        successRedirect: "/",
        failureRedirect: "/log-in" //TODOOOOOOOOOOOOOOOOOOOOOOOOOOO

    })
);

//-----------------------

//Log-out
router.get("/log-out", (req, res) => {
    req.logout();
    res.send("Logged out")
        //res.redirect("/");
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