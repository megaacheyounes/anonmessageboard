var Reply = require('./models/reply');
var Thread = require('./models/thread');
var mongoose = require('mongoose');

let connect = () => {
    var DB = process.env.DB;
    if (!DB) {
        DB = require('./env');
    }
    mongoose.connect(DB);
}

let addThread = async (req, res) => {
    let text = req.body.text;
    let delete_password = req.body.delete_password;
    let board = req.params.board;

    let data = {
        text,
        delete_password,
        board
    };

    let t = new Thread(data)
    await t.save();
    res.json(t);
    //res.redirect('/b/' + board);
}
//hide reported;delete_password
let getRecentThreads = async (req, res) => {
    let board = req.params.board

    let docs = await Thread.find({
            board
        }, {
            text: 1,
            _id: 1,
            created_on: 1,
            bumped_on: 1,
            replies: 1
        })
        .sort('-bumped_on').populate('replies').limit(10).exec();

    res.json(docs);
}

let getThreadWithReplies = async (req, res) => {
    let _id = req.query.thread_id
    let board = req.params.board

    let doc = await Thread.findOne({
        _id,
        board
    }, {
        delete_password: 0,
        reported: 0
    }).populate('replies').exec()
    res.json(doc);
}

let reportThread = async (req, res) => {
    let _id = req.body.thread_id
    let board = req.params.board

    let t = await Thread.findOneAndUpdate({
        _id,
        board
    }, {
        $set: {
            reported: true
        }
    }).exec();

    res.json(SUCCESS);
}
let deleteThread = async (req, res) => {
    let _id = req.body.thread_id;
    let delete_password = req.body.delete_password;
    let board = req.params.board

    let t = await Thread.findOneAndRemove({
        _id,
        delete_password,
        board
    }).exec();

    if (t) {
        return res.json(SUCCESS);
    }

    res.json(DELETE_FAILED);
}

let addReply = async (req, res) => {
    let text = req.body.text
    let delete_password = req.body.delete_password
    let thread = req.body.thread_id
    let board = req.params.board
    let data = {
        thread,
        text,
        delete_password
    }

    let r = new Reply(data);
    await r.save()
    let t = await Thread.findOne({
        _id: thread,
        board
    }).exec();

    t.replies.push(r)
    await t.save()
    res.json(r);
    //    res.redirect('/b/' + board + '/' + thread_id);
}

let reportReply = async (req, res) => {
    let thread_id = req.body.thread_id
    let _id = req.body.reply_id
    let r = Reply.findOneAndUpdate({
        _id,
        thread_id
    }, {
        $set: {
            text: 'deleted',
            reported: true
        }
    }).exec();
    if (r) {
        res.json(SUCCESS);
    } else {
        res.json('failed');
    }
}
const SUCCESS = 'success';

const DELETE_FAILED = 'incorrect password';

let deleteReply = async (req, res) => {
    let _id = req.body.reply_id;
    let delete_password = req.body.delete_password;
    let thread_id = req.body.thread_id;
    let data = {
        thread_id,
        _id,
        delete_password
    }
    let r = await Reply.findOneAndUpdate(data, {
        $set: {
            text: 'deleted'
        }
    }).exec();
    if (r) {
        return res.json(SUCCESS)
    } else {
        return res.json(DELETE_FAILED)
    }
}
let board = async (req, res) => {
    let board = req.params.board;
    let t = await Thread.find({
        board
    }, {
        delete_password: 0,
        reported: 0
    }).sort('-created_on').limit(1).exec();

    res.json(t);
}
let boardThread = async (req, res) => {
    let board = req.params.board;
    let _id = req.params.thread;

    let t = await Thread.find({
        _id,
        board
    }, {
        delete_password: 0,
        reported: 0
    }).exec();

    res.json(t);
}
module.exports = {
    addThread,
    getRecentThreads,
    getThreadWithReplies,
    reportThread,
    deleteThread,
    addReply,
    reportReply,
    deleteReply,
    board,
    boardThread,
    connect
}