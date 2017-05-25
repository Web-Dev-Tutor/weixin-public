var server = require('express')();
var auth = require('node-weixin-auth');
var nwMessage = require('node-weixin-message');
var nwJSSDK = require('node-weixin-jssdk');
var nwSettings = require('node-weixin-settings');
var bodyParser = require('body-parser');
var fs = require('fs');
var errors = require('web-errors').errors;
console.log(errors);

server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
server.use(bodyParser.raw({
  type: 'text/xml'
}));

var app = {
  id: process.env.APP_ID || '',
  secret: process.env.APP_SECRET || '',
  token: process.env.APP_TOKEN || ''
};

server.get('/', function (req, res) {
  res.set('content-type', 'text/html');
  res.send(fs.readFileSync(__dirname + '/views/jssdk.html', 'utf8'));
  res.end();
});

server.all('/config', function (req, res) {
  var url = req.body.url || req.query.url;
  console.log('inside jssdk conifg');
  console.log('url', url);
  console.log('app', app);

  nwJSSDK.prepare(nwSettings, app, url, function (error, data) {
    console.log('after prepared', error, data);
    if (error) {
      return res.json({
        name: 'Failure',
        code: 1,
        message: 'Failure',
        data: data
      });
    }
    return res.json({
      name: 'Success',
      code: 0,
      message: 'Success',
      data: data
    });
  });
});

server.post('/ack', function (req, res) {
  var data = auth.extract(req.query);
  console.log('inside message');
  console.log('query', data);
  auth.ack(app.token, data, function (error, data) {
    console.log('body', req.body);
    if (error) {
      return;
    }
    if (data) {
      res.send(data);
    } else {
      if (!req.body) {
        return;
      }
      var xml = String(req.body);
      console.log(xml);
      if (!xml) {
        console.error('req.body must not be empty!');
        return;
      }
      var messages = nwMessage.messages;
      function text(message, res, callback, extra) {
        //message => 解析后的JSON
        //res => res
        //callback => callback
        //extra => 'some data',

        //Extra
        console.log(message);
        var reply = nwMessage.reply;
        //res是HTTP的res

        //回复文本
        var text = reply.text(message.ToUserName, message.FromUserName, message.Content);
        res.send(text)
      }
      messages.on.text(text);
      messages.onXML(req.body, res, function callback(message) {
        console.log('onXML');
        console.log(message);
        //After message handled.
      });
    }
    return;
  });
});

server.get('/ack', function (req, res) {
  var data = auth.extract(req.query);
  console.log('inside ack');
  console.log('query', data);
  auth.ack(app.token, data, function (error, echoStr) {
    console.log('echostr', echoStr);
    if (!error) {
      res.send(echoStr);
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

server.listen(port, function () {
  console.log('server running on ' + port);
  console.log(arguments);
});
