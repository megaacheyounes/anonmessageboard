var mongoose = require('mongoose');

let schema = new mongoose.Schema({
    text: String,
    delete_password: String,
    thread: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'thread'
    },
    created_on: {
        type: Date,
        default: Date.now()
    },
    reported: Boolean
});

module.exports = mongoose.model('reply', schema);