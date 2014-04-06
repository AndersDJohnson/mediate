var express = require('express');
var params = require('express-params');
var status = require('statuses');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

var openJSONFileDb = require('json-file-db');

var hateoas = require('./hateoas');
var url = require('./url');
var hostUrl = url.hostUrl;
var requestUrl = url.requestUrl;

module.exports = function (options) {

  var uri = options.uri;
  console.log('uri', uri);

  var resource = function (app, options) {
    var name = options.name;
    app.use('/' + name, makeResource(options));
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

  var openIdDb = function () {
    var db = openResourceDb('db/_id.json', idProperty);
    return db;
  };

  var makeResource = function (options) {
    options = options || {};

    var name = options.name;
    var schema = options.schema;

    var resourceUri = uri + '/' + name;
    var schemaPath = '/_schema';
    var schemaUri = resourceUri + schemaPath;

    var schemaUrl = function (req) {
      return hostUrl(req) + schemaUri;
    };

    var openDb = function () {
      var db = openResourceDb('db/' + name + '.json');
      return db;
    };


    var app = express();

    app.use(express.bodyParser());
    app.use(express.methodOverride());

    params.extend(app);


    app.param('id', Number);


    app.get(schemaPath, function (req, res, next) {
      res.json(
        hateoas.links({
          data: schema
        }, {
          self: hostUrl(req) + schemaUri,
          collection: hostUrl(req) + resourceUri
        })
      );
    });


    var list = function (req, res, next) {
      var db = openDb();
      db.get(function (err, data) {
        if (err) return next(err);
        var url = requestUrl(req);

        var items = _.map(data, function (item) {
          return {
            data: item,
            href: url + '/' + item[idProperty]
          };
        });

        res.json(
          hateoas.links({
            name: name,
            collection: {
              idProperty: idProperty,
              href: url,
              items: items
            }
          }, {
            self: url,
            schema: schemaUrl(req)
          })
        );
      });
    };

    app.get('/', list);


    var create = function (req, res, next) {
      var idDb = openIdDb();
      var db = openDb();
      var body = req.body;
      var keys = Object.keys(schema.properties);
      console.log(body, keys);
      body = _.pick(body, keys);
      var data = _.extend({}, body);
      idDb.getSingle(name, function (err, idData) {
        if (! idData) {
          idData = {};
          idData[idProperty] = name;
          idData.next = 1;
        }
        console.log('idData', idData);
        var nextIdData = _.extend({}, idData);
        nextIdData.next += 1;
        idDb.put(nextIdData, function (err) {
          data[idProperty] = idData.next;
          db.put(data, function (err) {
            if (err) return next(err);
            res.json(status('created'), {
              data: data
            });
          });
       });
      });
    };

    app.post('/', create);


    var read = function (req, res, next) {
      var db = openDb();
      var id = req.params.id;
      db.getSingle(id, function (err, data) {
        if (err) return next(err);
        console.log('data', data);
        if (! data) {
          return res.json(status('not found'), {});
        }
        var url = requestUrl(req);
        res.json(
          hateoas.links({
            data: data
          }, {
            self: url,
            collection: hostUrl(req) + resourceUri,
            schema: schemaUrl(req)
          })
        );
      });
    };

    app.get('/:id', read);


    var update = function (req, res, next) {
      var db = openDb();
      var id = req.params.id;
      console.log('id:', id, typeof id);
      if (! id) return next(new Error("requires ID"));
      db.getSingle(id, function (err, data) {
        if (err) return next(err);

        if (! data) {
          return res.json(status('not found'), {});
        }

        var previous = data;
        if (! data) {
          data = {
            _id: id
          };
          previous = null;
        }
        var body = req.body;
        var keys = Object.keys(schema.properties);
        body = _.pick(body, keys);
        data = _.extend({}, data, body);

        console.log('updated data', data);

        db.put(data, function (err) {
          if (err) return next(err);
          res.json(status('ok'), {
            data: data
          });
        });
      })
    };

    app.put('/:id', update);
    app.patch('/:id', update);


    var del = function (req, res, next) {
      var db = openDb();
      var id = req.params.id;
      db.delete(id, function (err) {
        if (err) return next(err);
        res.json({});
      });
    };

    // idempotent - don't 404
    app.delete('/:id', del);


    resources[name] = {
      name: name,
      app: app
    };

    return app;
  };

  return resource;
};
