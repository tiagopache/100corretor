var express = require('express');
var router = express.Router();
var async = require('async');
var infra = require('./../../common/infra.js');
var processor = require('./../../common/processor.js');
var request = require("request");

router.post('/parcelas/avencer', function (req, res) {

  var ctrl_ps = req.header("ctrl_ps");
  var site = req.header("site");
  var cgccpf = req.header("cgccpf");

  var body = req.body;

  // A VENCER
  var optionsVencer = {
    method: 'POST',
    url: 'https://wwws.bradescosaude.com.br//PCBS-ConsPosApolice/ajaxConsultarAVencer.do',
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    form: {
      'filtro.competencias': body.competencias,
      'filtro.ramos': body.ramos,
      'filtro.codigoCorretor': body.codigoCorretor,
      'filtro.cnpj': body.cnpj,
      'filtro.cia': body.cia,
      nroControle: ctrl_ps,
      site: site,
      cd_cgccpf: cgccpf,
      'filtro.pagina': body.pagina,
      'filtro.orderBy': body.orderBy,
      'filtro.orderByColumn': body.orderByColumn
    }
  };

  // COUNT
  var optionsCount = {
    method: 'POST',
    url: 'https://wwws.bradescosaude.com.br//PCBS-ConsPosApolice/ajaxConsultarCountAVencer.do',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    form: {
      'filtro.competencias': body.competencias,
      'filtro.ramos': body.ramos,
      'filtro.codigoCorretor': body.codigoCorretor,
      'filtro.cnpj': body.cnpj,
      'filtro.cia': body.cia,
      nroControle: ctrl_ps,
      site: site,
      cd_cgccpf: cgccpf
    }
  };

  var requestList = [];
  requestList.push(optionsVencer);
  requestList.push(optionsCount);

  async.map(requestList, function (options, callback) {
    var i = 0;
    infra.timming('Request ' + i, () => {
      request(options, function (error, response, body) {
        ++i;
        if (!error && response.statusCode === 200) {
          var body = JSON.parse(body);

          callback(null, body);
        } else {
          callback(error || response.statusCode);
        }
      });
    });
  }, function (err, results) {
    if (!err) {
      console.log(results);

      var result = {};
      result.listaDados = [];

      results.forEach(function (item) {
        result.contentType = item.contentType || null;

        if (item.listaDados !== null)
            item.listaDados.forEach(function(dados) {
                result.listaDados.push(dados);
            }, this);
        
        result.mensagem = item.mensagem || null;

        result.mensagemErro = item.mensagemErro || null;

        result.ocorreuErro = item.ocorreuErro !== false;

        result.qtdTotalRegistros = item.qtdTotalRegistros || null;
        
        result.totalParcela = item.totalParcela || null;
      }, this);

      res.type('json');
      res.end(JSON.stringify(result));
    } else {
      // something is wrong!
      console.log(err);
    }
  });

});

module.exports = router;