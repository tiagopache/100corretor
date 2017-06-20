var express = require('express');
var router = express.Router();

/* GET home page. */

router.get('/', function(req, res) {
  res.render('index', { title: 'Express', env: process.env.NODE_ENV || 'development' });
});

module.exports = router;
