var hateoas = {};

module.exports = hateoas;

hateoas.links = function (data, links) {
  var _links = data.links = data.links || [];
  Object.keys(links).forEach(function (rel) {
    var href = links[rel];
    _links.push({
      rel: rel,
      href: href
    });
  });
  return data;
};
