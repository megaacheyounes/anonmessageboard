var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    text: String,
    created_on: {
        type: Date,
        default: Date.now()
    },
    bumped_on: {
        type: Date,
        default: Date.now()
    },
    reported: {
        type: Boolean,
        default: false
    },
    delete_password: String,
    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'reply'
    }],
    board: String
});

schema.pre('save', (next) => {
    this.bumped_on = Date.now();
    next();
});

module.exports = mongoose.model('thread', schema);