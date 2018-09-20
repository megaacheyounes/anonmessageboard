var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
var should = chai.should();
let server = require('../server');
let ROUTE = '/api/replies/b1';
let Thread = require('../models/thread');
let Reply = require('../models/reply');
let controller = require('../controller')
controller.connect();

let board = 'b1'
describe('Reply test', () => {
    it('should get a thread with all the replies', async () => {
        let t = new Thread({
            text: 'lorem ispum dolor sit amet',
            delete_password: 'password',
            board
        })
        let r = new Reply({
            text: 'lorem replyyyy',
            delete_password: 'password',
            thread_id: t._id
        })
        let r2 = new Reply({
            text: 'lorem fqjskd,fmq,sdf kj',
            delete_password: 'password',
            thread_id: t._id
        })
        await r2.save()
        await r.save()
        await t.save()
        t.replies = [r, r2]
        await t.save();


        chai.request(server).get(ROUTE + '?thread_id=' + t._id).end((req, res) => {
            res.should.have.status(200)
            res.body.should.have.property('created_on')
            res.body.should.have.property('text')
            res.body.should.not.have.property('delete_password')
            res.body.should.not.have.property('reported')
            res.body.should.have.property('replies')
            res.body.replies.should.be.a('array')
            res.body.replies.should.have.length(2)
        })
    })

    it('should add the reply', async () => {
        let t = new Thread({
            text: 'lorem ispum dolor sit amet',
            delete_password: 'password',
            board
        })
        await t.save();

        let postData = {
            text: 'lorem ipsum dolor sit amet reply',
            delete_password: 'password',
            thread_id: t._id
        }
        chai.request(server).post(ROUTE).send(postData).end((req, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.should.have.property('text')
            res.body.should.have.property('thread')
        });
    })

    it('should report a reply', async () => {
        let t = new Thread({
            text: 'lorem ispum dolor sit amet',
            delete_password: 'password',
            board
        })
        await t.save()
        let r = new Reply({
            text: 'lorem upusjhds qm kj',
            delete_password: 'rpassword',
            thread_id: t._id
        })
        await r.save()
        t.replies.push(r)
        await t.save();

        let postData = {
            reply_id: r._id,
            thread_id: t._id
        }

        chai.request(server).put(ROUTE).send(postData).end((req, res) => {
            res.should.have.status(200)
            res.body.should.be.a('string').eql('success')
            /*
            res.body.should.be.a('object')
            res.body.should.have.property('text')
            res.body.should.have.property('thread')
            res.body.should.have.property('reported').eql(true)*/
        });
    })

    describe('delete tests', () => {
        it('should not delete reply', async () => {
            let t = new Thread({
                text: 'lorem ispum dolor sit amet',
                delete_password: 'password',
                board
            })
            await t.save()
            let r = new Reply({
                text: 'lorem upusjhds qm kj',
                delete_password: 'password',
                thread_id: t._id
            })
            await r.save()
            t.replies.push(r)
            await t.save();

            let postData = {
                thread_id: t._id,
                reply_id: r._id,
                delete_password: 'wrong password'
            }

            chai.request(server).delete(ROUTE).send(postData).end((req, res) => {
                res.should.have.status(200)
                res.body.should.be.a('string').eql('incorrect password')
            })
        })

        it('should delete reply', async () => {
            let t = new Thread({
                text: 'lorem ispum dolor sit amet',
                delete_password: 'password',
                board
            })
            await t.save()
            let r = new Reply({
                text: 'lorem upusjhds qm kj',
                delete_password: 'rpassword',
                thread_id: t._id
            })
            await r.save()
            t.replies.push(r)
            await t.save();

            let postData = {
                reply_id: r._id,
                thread_id: t._id,
                delete_password: 'rpassword'
            }

            chai.request(server).delete(ROUTE).send(postData).end((req, res) => {
                res.should.have.status(200)
                res.body.should.be.a('string').eql('success')
            })
        })
    })
})