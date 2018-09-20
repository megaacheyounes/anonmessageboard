var express = require('express');
var app = express();
let controller = require('./controller');
var helmet = require('helmet')
let bodyParser = require('body-parser');
controller.connect();

app.use(helmet.frameguard({
  action: 'sameorigin'
}))
app.use(helmet.dnsPrefetchControl());
app.use(helmet.referrerPolicy({
  policy: 'same-origin'
}))
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  urlencoded: true
}));

app.get('b/:board', controller.board);
app.get('b/:board/:thread', controller.boardThread);

app.route('/api/threads/:board')
  .get(controller.getRecentThreads)
  .post(controller.addThread)
  .put(controller.reportThread)
  .delete(controller.deleteThread);

app.route('/api/replies/:board')
  .get(controller.getThreadWithReplies)
  .post(controller.addReply)
  .put(controller.reportReply)
  .delete(controller.deleteReply);

//add redirect routes
// listen for requests :)
var listener = app.listen(process.env.PORT | 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

module.exports = app