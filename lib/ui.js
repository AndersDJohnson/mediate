var express = require('express');

var app = express();

module.exports = app;

app.use(express.static('ui'));
