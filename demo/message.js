var server = require('express')();
var auth = require('node-weixin-auth');
var bodyParser = require('body-parser');
var errors = require('web-errors').errors;

server.use(bodyParser.urlencoded({extended: false}));
server.use(bodyParser.json());

var app = {
  id: process.env.APP_ID || '',
  secret: process.env.APP_SECRET || '',
  token: process.env.APP_TOKEN || ''
};

server.get('/ack', function(req, res) {
  var data = auth.extract(req.query);
  auth.ack(app.token, data, function (error, data) {
    if (!error) {
      res.send(data);
      return;
    }
    switch (error) {
      case 1:
        res.send(errors.INPUT_INVALID);
        break;
      case 2:
        res.send(errors.SIGNATURE_NOT_MATCH);
        break;
      default:
        res.send(errors.UNKNOWN_ERROR);
        break;
    }
  });
});

var port = 2048;

server.listen(port, function() {
  console.log('server running on ' + port);
  console.log(arguments);
});
