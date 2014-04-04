var resource = 'user';

var slice = Array.prototype.slice;

var makeForm = function (options) {
  options = $.extend({}, options);
  var promises = {};
  promises.schema = $.ajax({
    url: '/api/' + options.resource + '/schema'
  });

  if (options.id) {
    promises.value = $.ajax({
      url: '/api/' + options.resource + '/' + options.id
    });
  }

  $.whenObject(promises)
    .done(function (results) {
      $(function () {
        var $form = $('<form>');
        $form.attr({
          action: '/api/' + options.resource + '/' + options.id,
          method: 'post'
        });
        $form.jsonForm({
            schema: results.schema[0],
            value: results.value[0].item
        });
        $(document.body).append($form);
      });
    })
    .fail(function (results) {
      console.error('FAILURE', results);
    });
};

makeForm({
  resource: 'user',
  id: '123'
});
