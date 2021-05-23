var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const { DateTime } = require("luxon");


var MessageSchema =
    new Schema({
        tittle: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        messageText: { type: String, required: true },
        author: { type: String, required: true }
    });

MessageSchema
    .virtual('publication_date_formatted')
    .get(function() {
        return DateTime.fromJSDate(this.timestamp).toFormat('MMMM dd, yyyy');
    });


//Export model
module.exports = mongoose.model('Message', MessageSchema);