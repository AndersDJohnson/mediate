var express = require('express');

var app = express();

var api = require('./lib/api');
var ui = require('./lib/ui');

app.use('/api', api);
app.use('/', ui);

app.listen(9000);
