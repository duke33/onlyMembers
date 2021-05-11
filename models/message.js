var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var MessageSchema =
    new Schema({
        tittle: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        messageText: { type: String, required: true },
        author: { type: String, required: true }
    });


//Export model
module.exports = mongoose.model('Message', MessageSchema);