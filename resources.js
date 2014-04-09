module.exports = function (resource) {

  resource({
    name: 'user',
    schema: {
      type: 'object',
      properties: {
        name: {
          title: 'Name',
          type: 'string',
          required: true
        },
        age: {
          title: 'Age',
          type: 'number'
        },
        posts: {
          title: 'Posts',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: {
                title: 'Title',
                type: 'string',
                required: true
              },
              tags: {
                title: 'Tags',
                type: 'array',
                items: {
                  title: 'Tag',
                  type: 'string'
                }
              }
            }
          }
        }
      }
    }
  });

  resource({
    name: 'post',
    schema: {
      type: "object",
      properties: {
        name: {
          title: 'Title',
          type: 'string',
          required: true
        },
        date: {
          title: 'Date',
          type: 'string',
          format: 'date'
        }
      }
    }
  });

};
