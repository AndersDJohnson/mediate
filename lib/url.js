var out = {};

module.exports = out;

out.requestUrl = function (req) {
  return out.hostUrl(req) + req.originalUrl;
};

out.hostUrl = function (req) {
  return req.protocol + '://' + req.get('host');
};
