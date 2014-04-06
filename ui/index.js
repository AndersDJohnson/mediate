var resource = 'user';

var slice = Array.prototype.slice;

Handlebars.registerHelper('json', function(obj) {
  return JSON.stringify(obj);
});

var render = function (template, data) {
  return Handlebars.compile(template)(data);
};

var getItem = function ($el) {
  return $el.closest('[data-item]').data('item');
};

var alpacaOptions = {
  ui: 'bootstrap',
  options: {
    renderForm: true,
    form: {
      buttons: {
        submit: {},
        reset: {}
      }
    }
  },
  postRender: function(alpacaForm) {
    window.alpacaForm = alpacaForm;
    var $form = alpacaForm.form.getEl();
    var method = $form.attr('data-method');
    if (method) {
      var $method = $('<input type="hidden" name="_method" />');
      $method.val(method);
      $form.append($method);
      $form.attr('method', 'post');
    }
    $form.ajaxForm({
      success: function (data, status, xhr, $form) {
        console.log('state.resource', state.resource);
        showResource(state.resource);
      }
    });
  }
};

var state = {
  resources: null,
  resource: null
};

var showResources = function () {
  $.whenObject({
    data: $.get('/api'),
    template: $.get('/templates/resources.hbs')
  })
    .done(function (results) {
      var data = results.data[0];

      state.resources = data;

      var items = data.collection.items;
      _.each(items, function (item) {
        // item._resource = _.pick(data, ['name', 'links']);
      });

      var html = render(results.template[0], data);
      $(function () {
        var $html = $(html);
        $html.on('click', 'a.list', function (e) {
          e.preventDefault();
          var $el = $(e.currentTarget);
          showResource(getItem($el));
        });
        $html.on('click', 'a.add', function (e) {
          e.preventDefault();
          var $el = $(e.currentTarget);
          addResource(getItem($el));
        });
        var $resources = $('#resources');
        $resources.html($html);
      });
    })
    .fail(function (results) {
      throw new Error();
    });
};

var addResource = function (resource) {
  console.log('resource', resource);
  $.whenObject({
    data: $.get(resource.href)
  })
    .done(function (results) {
      console.log(results);
      var data = results.data[0];
      showFormAdd(data);
    });
};

var showResource = function (resource) {
  console.log('resource', resource);

  var href = resource.href || resource.collection.href;

  $.whenObject({
    data: $.get(href),
    template: $.get('/templates/resource.hbs')
  })
    .done(function (results) {
      var data = results.data[0];

      state.resource = data;

      var items = data.collection.items;
      _.each(items, function (item) {
        // var _resource = _.omit(data, ['links']);
        var _resource = _.extend({}, data);
        _resource.collection = _.omit(_resource.collection, ['items']);
        item._resource = _resource;
      });

      console.log('items', items);
      console.log('data', data);
      var html = render(results.template[0], data);
      $(function () {
        var $html = $(html);
        $html.on('click', 'a.edit', function (e) {
          e.preventDefault();
          var $el = $(e.currentTarget);
          showFormEdit(getItem($el));
        });
        $html.on('click', 'a.delete', function (e) {
          e.preventDefault();
          var $el = $(e.currentTarget);
          deleteItem(getItem($el));
        });
        var $resource = $('#resource');
        $resource.html($html);
      });
    });
};

var showFormAdd = function (resource) {
  console.log('resource', resource);

  var collectionHref = resource.collection.href;
  var idProperty = resource.collection.idProperty;

  var href = collectionHref;

  var schemaLink = _.findWhere(resource.links, {rel: 'schema'});
  var schemaHref = schemaLink.href;

  var promises = {};

  promises.schema = $.ajax({
    url: schemaHref
  });

  promises.template = $.get('/templates/form.hbs');

  $.whenObject(promises)
    .done(function (results) {
      console.log('results', results);
      $(function () {
        var html = render(results.template[0], {
          item: item
        });
        var $html = $(html);
        var $container = $html.findWithSelf('.form-container');


        var options = _.merge({}, alpacaOptions, {
          schema: results.schema[0],
          data: itemData,
          options: {
            form: {
              attributes: {
                action: resource.collection.href,
                method: "post"
              }
            }
          }
        });
        $container.alpaca(options);

        $('#form').html($html);
      });
    })
    .fail(function (results) {
      console.error('FAILURE', results);
    });
};

var showFormEdit = function (item) {
  console.log('item', item);

  var resource = item._resource;

  console.log('resource', resource);

  var collectionHref = resource.collection.href;
  var idProperty = resource.collection.idProperty;

  var href = collectionHref + '/' + item[idProperty];

  var schemaLink = _.findWhere(resource.links, {rel: 'schema'});
  var schemaHref = schemaLink.href;

  var promises = {};

  promises.schema = $.ajax({
    url: schemaHref
  });

  promises.template = $.get('/templates/form.hbs');

  var itemData = _.omit(item, ['_resource']);

  $.whenObject(promises)
    .done(function (results) {
      console.log('results', results);
      $(function () {
        var html = render(results.template[0], {
          item: item
        });
        var $html = $(html);
        var $container = $html.findWithSelf('.form-container');

        var options = _.merge({}, alpacaOptions, {
          schema: results.schema[0],
          data: itemData,
          options: {
            form: {
              attributes: {
                action: item.href,
                'data-method': 'patch'
              }
            }
          }
        });
        console.log(options);
        $container.alpaca(options);

        $('#form').html($html);
      });
    })
    .fail(function (results) {
      console.error('FAILURE', results);
    });
};

var deleteItem = function (item) {
  console.log('item', item);

  var resource = item._resource;
  var idProperty = resource.collection.idProperty;

  console.log('resource', resource);

  $.delete(item.href)
    .done(function () {
      showResource(resource);
    });
};

showResources();
