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

var showResources = function () {
  $.whenObject({
    data: $.get('/api'),
    template: $.get('/templates/resources.hbs')
  })
    .done(function (results) {
      var data = results.data[0];
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
      var data = results.data;
      showFormAdd(data);
    });
};

var showResource = function (resource) {
  console.log('resource', resource);
  $.whenObject({
    data: $.get(resource.href),
    template: $.get('/templates/resource.hbs')
  })
    .done(function (results) {
      var data = results.data[0];
      var items = data.collection.items;
      _.each(items, function (item) {
        console.log('data', data);
        var _resource = _.omit(data, ['links']);
        _resource.collection = _.omit(_resource.collection, ['items']);
        item._resource = _resource;
      });
      var html = render(results.template[0], data);
      $(function () {
        var $html = $(html);
        $html.on('click', 'a.edit', function (e) {
          e.preventDefault();
          var $el = $(e.currentTarget);
          showFormEdit(getItem($el));
        });
        var $resource = $('#resource');
        $resource.html($html);
      });
    });
};

var onSubmitAdd = function (resource, $form) {
  return function (errors, values) {
    console.log('add', resource, arguments);
  };
};

var showFormAdd = function (resource) {
  console.log('resource', resource);

  var collectionHref = resource.collection.href;
  var idProperty = resource.collection.idProperty;

  var href = collectionHref;

  var promises = {};
  promises.schema = $.ajax({
    url: collectionHref + '/schema'
  });

  $.whenObject(promises)
    .done(function (results) {
      $(function () {
        var $form = $('<form>');
        $form.attr({
          action: href,
          method: 'put'
        });
        $form.jsonForm({
          schema: results.schema,
          onSubmit: onSubmitAdd(resource, $form)
        });
        $('#form').html($form);
      });
    })
    .fail(function (results) {
      console.error('FAILURE', results);
    });
};

var onSubmitEdit = function (item, $form) {
  return function (errors, values) {
    console.log('edit', item, arguments);
  };
};

var showFormEdit = function (item) {
  console.log('item', item);

  var resource = item._resource;
  var collectionHref = resource.collection.href;
  var idProperty = resource.collection.idProperty;

  var href = collectionHref + '/' + item[idProperty];

  var promises = {};
  promises.schema = $.ajax({
    url: collectionHref + '/schema'
  });

  promises.value = $.ajax({
    url: href
  });

  $.whenObject(promises)
    .done(function (results) {
      $(function () {
        var $form = $('<form>');
        $form.attr({
          action: href,
          method: 'post'
        });
        $form.jsonForm({
          schema: results.schema[0],
          value: results.value[0].item,
          onSubmit: onSubmitEdit(item, $form)
        });
        $('#form').html($form);
      });
    })
    .fail(function (results) {
      console.error('FAILURE', results);
    });
};

showResources();
