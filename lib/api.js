var express = require('express');
var _ = require('lodash');
var hostUrl = require('./url').hostUrl;
var _resource = require('./resource');
var resources = require('../resources');

module.exports = function (options) {

  var app = express();

  var uri = options.uri;

  var resource = _resource({
    uri: uri
  });

  app.get('/', function (req, res, next) {

    var apiUrl = hostUrl(req) + uri;

    var resrcs = resource.resources;
    _.each(resrcs, function (resrc) {
      resrc.href = apiUrl + '/' + resrc.name;
    });

    var out = {
      name: 'resources',
      collection: {
        href: apiUrl,
        items: _.map(resrcs, function (resrc) {
          return _.pick(resrc, ['name', 'href']);
        })
      },
      links: [
        {
          rel: 'self',
          href: apiUrl
        }
      ]
    };

    res.json(out);
  });

  resources(function (params) {
    return resource(app, params);
  });

  return app;
};