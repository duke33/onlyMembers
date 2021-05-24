var express = require('express');
var router = express.Router();
var User = require('../models/user');
const passport = require("passport");
const bcrypt = require("bcryptjs");
var Message = require('../models/message');
var controller = require('../controller');
const { body, validationResult } = require('express-validator');


/* GET home page. */
router.get('/', controller.main_get);


//-----------------------

//Sign-Up GET route 
router.get("/sign-up", (req, res) => res.render("sign-up-form"));

//Sign-Up POST route
router.post("/sign-up", controller.sign_up_post);

//-----------------------

// Log-in GET route
router.get("/log-in", (req, res) => res.render("log-in-form", { user: req.user }));

// Log-in POST route
router.post(
    "/log-in",
    passport.authenticate("local", {
        failureFlash: true,
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
router.post("/create-new-message", controller.new_message_post)
    //PP borrar los console log

//-----------------------
// Delete message
router.get("/message/:id/delete", controller.delete_message_get)


router.post("/message/:id/delete", controller.delete_message_post)

//TODO borrar las dependencias que no se usan


//-----------------------

// //Flash Message
// router.get('/flash', function(req, res) {
//     // Set a flash message by passing the key, followed by the value, to req.flash().
//     req.flash('info', 'Flash is back!')
//     res.redirect('/');
// });
//-----------------------
module.exports = router;