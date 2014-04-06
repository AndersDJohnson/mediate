module.exports = function (resource) {

  resource({
    name: 'user',
    schema: {
      type: "object",
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
    }
  });

};
