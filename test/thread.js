/*eslint-disable no-undef*/
var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();
let server = require('../server');
let ROUTE = '/api/threads/b1';
let Thread = require('../models/thread');
let controller = require('../controller')
let Reply = require('../models/reply')
controller.connect();
let board = 'b1';

describe('thread tests', () => {
    it('should save thread', async () => {
        let postData = {
            text: 'lorem ipsum dolor sit amet',
            delete_password: 'password',
            board
        }

        chai.request(server).post(ROUTE).send(postData)
            .end((req, res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have.property('created_on')
                res.body.should.have.property('bumped_on')
                res.body.should.have.property('reported').eql(false)

                //done()
            })
    })

    it('should report thread', async () => {
        let t = new Thread({
            text: 'erer',
            board
        });
        await t.save();

        let postData = {
            thread_id: t._id
        }

        chai.request(server).put(ROUTE).send(postData)
            .end((req, res) => {
                res.should.have.status(200)
                res.body.should.be.a('string').eql('success')
            })
    })

    it('should return latest threads', async () => {

        for (let index = 0; index < 1; index++) {
            let t = new Thread({
                text: 'lorem ' + index,
                delete_password: 'password',
                board
            })

            let r = new Reply({
                text: 'reply 1 ' + index,
                delete_password: 'password',
                thread_id: t._id
            })
            let r2 = new Reply({
                text: 'reply 2 ' + index,
                delete_password: 'password',
                thread_id: t._id
            })
            await r2.save()
            await r.save()
            t.replies.push(r)
            t.replies.push(r2)
            await t.save();
        }

        chai.request(server).get(ROUTE)
            .end((req, res) => {
                res.should.have.status(200)
                res.body.should.be.a('array')
                // res.body.should.all.have.deep.property('text')
                //  res.body.should.have.deep.property('text')
                //  res.body.should.have.nested.property('replies')
                res.body.should.all.not.have.nested.property('reported')
                res.body.should.all.not.have.nested.property('delete_password')
            })
    })
    it('should not delete thread', async () => {
        let delete_password = 'password'
        let t = new Thread({
            text: 'zedf',
            delete_password,
            board
        });
        await t.save();

        let postData = {
            thread_id: t._id,
            delete_password: 'wrong password'
        }

        chai.request(server).delete(ROUTE).send(postData)
            .end((req, res) => {
                res.should.have.status(200)
                res.body.should.be.a('string').eql('incorrect password')
            })
    })
    it('should delete thread', async () => {
        let delete_password = 'password'
        let t = new Thread({
            board,
            delete_password
        });

        await t.save();

        let postData = {
            thread_id: t._id,
            delete_password
        }

        chai.request(server).delete(ROUTE).send(postData)
            .end((req, res) => {
                res.should.have.status(200)
                res.body.should.be.a('string').eql('success')
            })
    })
})