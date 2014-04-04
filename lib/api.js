var express = require('express');

var app = express();

module.exports = app;

var resource = require('./resource')();

resource(app, 'user');
