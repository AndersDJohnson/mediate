var express = require('express');

var app = express();

var api = require('./lib/api');
var ui = require('./lib/ui');

app.use(express.logger('short'));

var apiUri = '/api';
app.use(apiUri, api({
  uri: apiUri
}));

app.use('/', ui);

app.listen(9000);
