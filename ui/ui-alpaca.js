
var alpacaOptions = {
  ui: 'bootstrap',
  options: {
    hideInitValidationError: true,
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
    $form.methodOverride();
    $form.on('submit', function () {
      console.log('value', alpacaForm.getValue());
    });
    $form.ajaxForm({
      success: function (data, status, xhr, $form) {
        console.log('state.resource', state.resource);
        showResource(state.resource);
      }
    });
  }
};

var showFormAdd = function (options) {
  var resource = options.resource;

  var html = render(options.template);
  var $html = $(html);
  var $container = $html.findWithSelf('.form-container');

  var options = _.merge({}, alpacaOptions, {
    schema: options.schema.data,
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
};

var showFormEdit = function (options) {
  var item = options.item;

  var html = render(options.template, {
    item: item
  });
  var $html = $(html);
  var $container = $html.findWithSelf('.form-container');

  var options = _.merge({}, alpacaOptions, {
    schema: options.schema.data,
    data: item.data,
    options: {
      form: {
        attributes: {
          action: item.href,
          method: 'patch'
        }
      }
    }
  });
  console.log(options);
  $container.alpaca(options);

  $('#form').html($html);
};
