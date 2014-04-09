
var jsonFormOptionDefaults = {
  /*
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
  */
};

var showFormAdd = function (options) {
  var resource = options.resource;

  var html = render(options.template);
  var $html = $(html);
  var $container = $html.findWithSelf('.form-container');

  var jsonFormOptions = _.merge({}, jsonFormOptionDefaults, {
    schema: options.schema.data,
    /*options: {
      form: {
        attributes: {
          action: resource.collection.href,
          method: "post"
        }
      }
    }*/
    onSubmit: function (errors, values) {
      if (errors) {
        alert('Check the form for invalid values!');
        return;
      }
      // "values" follows the schema, yeepee!
      console.log(values);
      addItem(values, options);
    }
  });

  var $form = $('<form>');
  $form.jsonForm(jsonFormOptions);
  $container.append($form);
  $('#form').html($container);
};

var showFormEdit = function (options) {
  var item = options.item;

  var html = render(options.template, {
    item: item
  });
  var $html = $(html);
  var $container = $html.findWithSelf('.form-container');

  var jsonFormOptions = _.merge({}, jsonFormOptionDefaults, {
    schema: options.schema.data,
    value: item.data,
    /*options: {
      form: {
        attributes: {
          action: item.href,
          method: 'patch'
        }
      }
    }*/
    onSubmit: function (errors, values) {
      if (errors) {
        alert('Check the form for invalid values!');
        return;
      }
      // "values" follows the schema, yeepee!
      console.log(values);
      editItem(values, options);
    }
  });

  var $form = $('<form>');
  $form.jsonForm(jsonFormOptions);
  $container.append($form);
  $('#form').html($container);
};
