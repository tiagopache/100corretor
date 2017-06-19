var url = require('url');

var infra = {

  timming: function (name, callback) {
    var n = (name !== null && name !== undefined) ? name : callback.name;
    console.time(n);
    callback();
    console.timeEnd(n);
  },

  parseURL: function parseURL(_url) {
    var parsed = url.parse(_url),
      searchObject = {},
      queries, split, i;
    // Let the browser do the work
    //parsed.href = url;
    // Convert query string to object
    //queries = parsed.search.replace(/^\?/, '').split('&');
    queries = parsed.query.split('&');
    for (i = 0; i < queries.length; i++) {
      split = queries[i].split('=');
      searchObject[split[0]] = split[1];
    }

    parsed.searchObject = searchObject;

    return parsed;
  },

  base64: {
    encrypt: function (value) {
      return new Buffer(value).toString('base64');
    },

    decrypt: function (token) {
      return new Buffer(token, 'base64').toString('utf-8');
    }
  }

}
module.exports = infra;
