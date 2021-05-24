var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var UserSchema =
    new Schema({
        username: { type: String, required: true, maxlength: 16, minlength: 5 },
        password: { type: String, required: true, minlength: 5 },
        email: { type: String, required: true },
        isAdmin: { type: Boolean, default: false }
    });


//Export model
module.exports = mongoose.model('User', UserSchema);