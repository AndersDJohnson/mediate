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

    var items = _.map(resrcs, function (resrc) {
      return {
        data: _.pick(resrc, ['name']),
        href: apiUrl + '/' + resrc.name
      };
    });

    var out = {
      collection: {
        href: apiUrl,
        items: items
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
