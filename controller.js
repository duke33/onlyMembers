const { body, validationResult } = require('express-validator');
var User = require('./models/user');
const bcrypt = require("bcryptjs");
var express = require('express');
var router = express.Router();
const passport = require("passport");
var Message = require('./models/message');



exports.main_get = [function(req, res, next) {

    Message.find().sort({ timestamp: -1 }).
    exec(function(err, message_list) {
        if (err) { return next(err); }

        res.render('index', { title: 'Message List', message_list: message_list, user: req.user });
    });

}];


exports.sign_up_post = [

    // VALIDATION AND SANITIZATION. This validation is happening in the front end (html) aswel. I'll leave this as for now, because I might change it.
    body('username').trim().escape().isLength({ min: 5, max: 16 }).withMessage("Username must have between 5 to 16 characters"),

    body('password').isLength({ min: 5, max: 16 }).escape().withMessage('Password must be between 5 to 16 characters'),
    body('email').isEmail().withMessage("E-mail must have the format example@mail.com"),

    // Password confirmation validation
    body('passwordConfirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        }

        return true;
    }).escape(),

    body('username').custom(value => {
        return User.findOne({ username: value }).then(user => {

            if (user) {
                return Promise.reject('User already in use');
            }
        });
    }),


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
    }
]

exports.new_message_post = [

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
    }
]

exports.delete_message_get = (req, res) => {

    Message.findById(req.params.id).
    exec(function(err, message) {
        if (err) { return next(err); }
        // Successful, so render

        res.render('message-delete-form', { title: 'Delete Message', message: message });
    })
}

exports.delete_message_post = (req, res) => {

    Message.findByIdAndRemove(req.params.id).
    exec(function(err) {
        if (err) { return next(err); }
        // Successful, so render

        res.redirect("/");
    })
}