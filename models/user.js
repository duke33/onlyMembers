var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var UserSchema =
    new Schema({
        username: { type: String, required: true, maxlength: 5, minlength: 16 },
        password: { type: String, required: true, maxlength: 5, minlength: 16 },
        email: { type: String, required: true },
        isAdmin: { type: Boolean, default: false }
    });


//Export model
module.exports = mongoose.model('User', UserSchema);