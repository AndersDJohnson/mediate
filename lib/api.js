var express = require('express');
var _ = require('lodash');
var baseUrl = require('./baseUrl');

var app = express();

module.exports = app;

var resource = require('./resource')();

resource(app, 'user');

app.get('/', function (req, res, next) {
  var resrcs = resource.resources;
  _.each(resrcs, function (resrc) {
    var url = baseUrl(req) + '/' + resrc.name;
    resrc.href = url;
  });
  var url = baseUrl(req);
  var out = {
    name: 'resources',
    collection: {
      href: url,
      items: _.map(resrcs, function (resrc) {
        return _.pick(resrc, ['name', 'href']);
      })
    },
    links: [
      {
        rel: 'self',
        href: url
      }
    ]
  };
  res.json(out);
});

