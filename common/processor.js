var jsdom = require('jsdom/lib/old-api.js');
var infra = require('./infra.js');

var processor = {}

processor.html = function (body, customProcessor) {

    jsdom.env(
        body,
        //['https://code.jquery.com/jquery-3.2.1.min.js'],
        //['http://code.jquery.com/jquery-1.6.min.js'],
        customProcessor);

}

module.exports = processor;