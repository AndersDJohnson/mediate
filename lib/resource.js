var express = require('express');
var _ = require('lodash');
var openJSONFileDb = require('json-file-db');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var status = require('statuses');
var baseUrl = require('./baseUrl');

var resource = function (app, name) {
  app.use('/' + name, makeResource(name));
};

module.exports = function () {
  return resource;
};

var resources = resource.resources = {};

var idProperty = '_id';

var openResourceDb = function (filepath) {
  if (! fs.existsSync(filepath)) {
    mkdirp.sync(path.dirname(filepath));
    fs.writeFileSync(filepath, '[]', 'utf8');
  }
  return openJSONFileDb(filepath, idProperty);
};

var makeResource = function (name) {

  var app = express();

  app.use(express.bodyParser());

  var openDb = function () {
    var db = openResourceDb('db/' + name + '.json');
    return db;
  };

  app.get('/schema', function (req, res, next) {
    res.json({
      properties: {
        name: {
          title: 'Name',
          type: "string",
          required: true
        },
        age: {
          title: 'Age',
          type: "number"
        }
      }
    });
  });

  app.get('/', function (req, res, next) {
    var db = openDb();
    db.get(function (err, data) {
      if (err) return next(err);
      var url = baseUrl(req);

      var items = _.map(data, function (item) {
        item.href = url + '/' + item[idProperty];
        return item;
      });

      res.json({
        name: name,
        collection: {
          idProperty: idProperty,
          href: url,
          items: items
        },
        links: [
          {
            rel: 'self',
            href: url
          }
        ]
      });
    });
  });

  app.get('/:id', function (req, res, next) {
    var db = openDb();
    var id = req.params.id;
    db.getSingle(id, function (err, data) {
      if (err) return next(err);
      if (! data) return next(new Error("no data", data));
      res.json({
        item: data
      });
    });
  });

  app.post('/:id', function (req, res, next) {
    var db = openDb();
    var id = req.params.id;
    console.log(id);
    if (! id) return next(new Error("requires ID"));
    db.getSingle(id, function (err, data) {
      if (err) return next(err);
      console.log(data, typeof data, data ? data.length : null);
      var pre = data;
      if (! data) {
        data = {
          _id: id
        };
        pre = null;
      }
      data = _.extend({}, data, req.body);
      db.put(data, function (err) {
        if (err) return next(err);
        res.json(status('created'), {
          data: {
            pre: pre,
            form: req.body,
            item: data
          }
        });
      });
    })
  });

  resources[name] = {
    name: name,
    app: app
  };

  return app;
};
