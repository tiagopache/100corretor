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

//   result = {
    //     "contentType": null,
    //     "listaDados": [{
    //       "apoliceConjugada": "434280",
    //       "cnpj": "2049636000153",
    //       "codigoCia": "571",
    //       "codigoCorretor": null,
    //       "codigoRamo": 876,
    //       "competencia": "201706",
    //       "cpd": "431254",
    //       "dataPrevPagamento": null,
    //       "dataVencimento": "2017-06-27T20:36:36",
    //       "flag": null,
    //       "iof": 166.52,
    //       "notaManual": false,
    //       "numApolice": "434279",
    //       "numApoliceMestra": 434279,
    //       "numBloqueto": 10338856597,
    //       "orderBy": null,
    //       "orderByField": null,
    //       "pagina": null,
    //       "subTotal": false,
    //       "subfatura": "1",
    //       "sucursalEmissora": "865",
    //       "valor": null,
    //       "valorEmitido": 7163.27
    //     }, ],
    //     "mensagem": null,
    //     "mensagemErro": null,
    //     "ocorreuErro": false,
    //     "qtdTotalRegistros": null,
    //     "totalParcela": null
    //   }

// GET 'https://wwws.bradescoseguros.com.br/100Corretor/br/saude/consultaApoliceNovoSaude.asp?NroControle=221547876593237721&Site=Corretor&cd_cgccpf=02190592000187&id_cia=1&ctrl=RJHFbIEARhXtEqACbQfSAAbHATgk' 
// -H 'Pragma: no-cache' 
// -H 'Accept-Encoding: gzip, deflate, sdch, br' 
// -H 'Accept-Language: en-US,en;q=0.8,pt-BR;q=0.6,pt;q=0.4' 
// -H 'Upgrade-Insecure-Requests: 1' 
// -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36' 
// -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8' 
// -H 'Referer: https://wwws.bradescosaude.com.br/Corretor/entrada_novoBrq.asp?NroControle=221547876593237721&ctrl=RJHFbIEARhXtEqACbQfSAAbHATgk&cd_cgccpf=02190592000187&id_cia=1&servico=saude&urlCorPortalsaude=https://wwws.bradescosaude.com.br&urlCorWww3=https://wwws.bradescoseguros.com.br&urlInst=http://www.bradescoseguros.com.br&nome=MAXVEL%20COR.%20E%20ADM.%20DE%20SEGS%20S/S' 
// -H 'Cookie: ASPSESSIONIDQQARBDBT=PHHNBDHCINKMLPCHMIFALAIM; ASPSESSIONIDSQCTCABS=OMHMFEMDFACMLPGEEEOGBLJB; ASPSESSIONIDQQDRBCAS=OLAKBNGAKDNLAFLKNEFBFIAG; ASPSESSIONIDSSBQACAT=EMADNFBBIHMICGJPKOGPPAEF; __utmt=1; JSESSIONID=0001dOlAeiLo2CErF1vIPm2JZ9o:21E3UN5V22; __utma=59108651.463785339.1496697576.1497036145.1497041077.10; __utmb=59108651.8.10.1497041077; __utmc=59108651; __utmz=59108651.1496697576.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); ACE_Corretor=R2586135859' 
// -H 'Connection: keep-alive' 
// -H 'Cache-Control: no-cache'

// GET 'https://wwws.bradescosaude.com.br//PCBS-ConsPosApolice/parcelasavencer.do?NroControle=520341952596337741&Site=Corretor&cd_cgccpf=02190592000187&id_cia=1&ctrl=RJHrCcDARhXtEqACbQfSAAbHQFhk' 
// -H 'Pragma: no-cache' 
// -H 'Accept-Encoding: gzip, deflate, sdch, br' 
// -H 'Accept-Language: en-US,en;q=0.8,pt-BR;q=0.6,pt;q=0.4' 
// -H 'Upgrade-Insecure-Requests: 1' 
// -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36' 
// -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8' 
// -H 'Cache-Control: no-cache' 
// -H 'Cookie: gsScrollPos-1313=0; ASPSESSIONIDCACTQARR=GIBBEFMCCOJHBGOHLHNKILOO; ASPSESSIONIDCCBQRDRQ=MAIPIBJDDICCFIMNFMLNCPCA; ASPSESSIONIDAAASTAQR=IFHDCKCBJBGAFBGOLECBEMJG; ASPSESSIONIDASDSBSBD=CJJELJMAIPJNEKHHDGKMKBKG; ASPSESSIONIDCCCTSBRQ=JBOKAKCBHFPAJIMHIMIAGKCK; ASPSESSIONIDCQTRTBTB=CPKDDAEDJFPIJDIFHBGCKOJN; ASPSESSIONIDASTSRARD=DPOHGAEDLMGHOKFADBJEMFPF; PAGINA_SAUDE=R3148930414' 
// -H 'Connection: keep-alive' 
// --compressed

// POST 'https://wwws.bradescosaude.com.br//PCBS-ConsPosApolice/ajaxConsultarCompetenciaAVencer.do' 
// -H 'Pragma: no-cache' 
// -H 'Origin: https://wwws.bradescosaude.com.br' 
// -H 'Accept-Encoding: gzip, deflate, br' 
// -H 'Accept-Language: en-US,en;q=0.8,pt-BR;q=0.6,pt;q=0.4' 
// -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36' 
// -H 'Content-Type: application/x-www-form-urlencoded' 
// -H 'Accept: application/json, text/javascript, */*; q=0.01' 
// -H 'Cache-Control: no-cache' 
// -H 'X-Requested-With: XMLHttpRequest' 
// -H 'Cookie: ASPSESSIONIDCACTQARR=GIBBEFMCCOJHBGOHLHNKILOO; ASPSESSIONIDCCBQRDRQ=MAIPIBJDDICCFIMNFMLNCPCA; ASPSESSIONIDAAASTAQR=IFHDCKCBJBGAFBGOLECBEMJG; ASPSESSIONIDASDSBSBD=CJJELJMAIPJNEKHHDGKMKBKG; ASPSESSIONIDCCCTSBRQ=JBOKAKCBHFPAJIMHIMIAGKCK; PAGINA_SAUDE=R3148930414' 
// -H 'Connection: keep-alive' 
// -H 'Referer: https://wwws.bradescosaude.com.br//PCBS-ConsPosApolice/parcelasavencer.do?NroControle=221547876593237721&Site=Corretor&cd_cgccpf=02190592000187&id_cia=1&ctrl=RJHFbIEARhXtEqACbQfSAAbHATgk' 
// --data 'filtro.competencias=&filtro.ramos=876,878&filtro.codigoCorretor=&filtro.cnpj=&filtro.cia=&nroControle=221547876593237721&site=Corretor&cd_cgccpf=02190592000187' 
// --compressed


//COUNT POST 'https://wwws.bradescosaude.com.br//PCBS-ConsPosApolice/ajaxConsultarCountAVencer.do' 
// -H 'Pragma: no-cache' 
// -H 'Origin: https://wwws.bradescosaude.com.br' 
// -H 'Accept-Encoding: gzip, deflate, br' 
// -H 'Accept-Language: en-US,en;q=0.8,pt-BR;q=0.6,pt;q=0.4' 
// -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36' 
// -H 'Content-Type: application/x-www-form-urlencoded' 
// -H 'Accept: application/json, text/javascript, */*; q=0.01' 
// -H 'Cache-Control: no-cache' 
// -H 'X-Requested-With: XMLHttpRequest' 
// -H 'Cookie: ASPSESSIONIDCACTQARR=GIBBEFMCCOJHBGOHLHNKILOO; ASPSESSIONIDCCBQRDRQ=MAIPIBJDDICCFIMNFMLNCPCA; ASPSESSIONIDAAASTAQR=IFHDCKCBJBGAFBGOLECBEMJG; ASPSESSIONIDASDSBSBD=CJJELJMAIPJNEKHHDGKMKBKG; ASPSESSIONIDCCCTSBRQ=JBOKAKCBHFPAJIMHIMIAGKCK; PAGINA_SAUDE=R3148930414' 
// -H 'Connection: keep-alive' 
// -H 'Referer: https://wwws.bradescosaude.com.br//PCBS-ConsPosApolice/parcelasavencer.do?NroControle=221547876593237721&Site=Corretor&cd_cgccpf=02190592000187&id_cia=1&ctrl=RJHFbIEARhXtEqACbQfSAAbHATgk' 
// --data 'filtro.competencias=06/2017&filtro.ramos=876,878&filtro.codigoCorretor=100024-770,101147-770,101238-726,104729-227,105056-770,113753-227,113753-239,113753-587,113928-227,114041-327,303602-327,303610-327,303628-327,431253-865,431253-976,431254-865,461210-865,461210-976,461211-976,461212-865&filtro.cnpj=&filtro.cia=0&nroControle=221547876593237721&site=Corretor&cd_cgccpf=02190592000187' 
// --compressed


//grid POST 'https://wwws.bradescosaude.com.br//PCBS-ConsPosApolice/ajaxConsultarAVencer.do' 
// -H 'Pragma: no-cache' 
// -H 'Origin: https://wwws.bradescosaude.com.br' 
// -H 'Accept-Encoding: gzip, deflate, br' 
// -H 'Accept-Language: en-US,en;q=0.8,pt-BR;q=0.6,pt;q=0.4' 
// -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36' 
// -H 'Content-Type: application/x-www-form-urlencoded' 
// -H 'Accept: application/json, text/javascript, */*; q=0.01' 
// -H 'Cache-Control: no-cache' 
// -H 'X-Requested-With: XMLHttpRequest' 
// -H 'Cookie: ASPSESSIONIDCACTQARR=GIBBEFMCCOJHBGOHLHNKILOO; ASPSESSIONIDCCBQRDRQ=MAIPIBJDDICCFIMNFMLNCPCA; ASPSESSIONIDAAASTAQR=IFHDCKCBJBGAFBGOLECBEMJG; ASPSESSIONIDASDSBSBD=CJJELJMAIPJNEKHHDGKMKBKG; ASPSESSIONIDCCCTSBRQ=JBOKAKCBHFPAJIMHIMIAGKCK; PAGINA_SAUDE=R3148930414' 
// -H 'Connection: keep-alive' 
// -H 'Referer: https://wwws.bradescosaude.com.br//PCBS-ConsPosApolice/parcelasavencer.do?NroControle=221547876593237721&Site=Corretor&cd_cgccpf=02190592000187&id_cia=1&ctrl=RJHFbIEARhXtEqACbQfSAAbHATgk' 
// --data 'filtro.competencias=06/2017&filtro.ramos=876,878&filtro.codigoCorretor=100024-770,101147-770,101238-726,104729-227,105056-770,113753-227,113753-239,113753-587,113928-227,114041-327,303602-327,303610-327,303628-327,431253-865,431253-976,431254-865,461210-865,461210-976,461211-976,461212-865&filtro.cnpj=&filtro.cia=0&nroControle=221547876593237721&site=Corretor&cd_cgccpf=02190592000187&filtro.pagina=0&filtro.orderBy=&filtro.orderByColumn=' 
// --compressed


// GET 'https://wwws.bradescosaude.com.br/Corretor/entrada_novoBrq.asp?NroControle=034689098606333711&ctrl=RJHsHJFARhXtEqACbQfSAAbHBYik&cd_cgccpf=02190592000187&id_cia=1&servico=saude&urlCorPortalsaude=https://wwws.bradescosaude.com.br&urlCorWww3=https://wwws.bradescoseguros.com.br&urlInst=http://www.bradescoseguros.com.br&nome=MAXVEL%20COR.%20E%20ADM.%20DE%20SEGS%20S/S' 
// -H 'Pragma: no-cache' 
// -H 'Accept-Encoding: gzip, deflate, sdch, br' 
// -H 'Accept-Language: en-US,en;q=0.8,pt-BR;q=0.6,pt;q=0.4' 
// -H 'Upgrade-Insecure-Requests: 1' 
// -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36' 
// -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8' 
// -H 'Referer: https://wwws.bradescoseguros.com.br/100Corretor/br/saude/default.asp?ctrl=RJHsHJFARhXtEqACbQfSAAbHBYik&cd_cgccpf=02190592000187&id_cia=1' 
// -H 'Cookie: ASPSESSIONIDCACTQARR=GIBBEFMCCOJHBGOHLHNKILOO; ASPSESSIONIDCCBQRDRQ=MAIPIBJDDICCFIMNFMLNCPCA; ASPSESSIONIDAAASTAQR=IFHDCKCBJBGAFBGOLECBEMJG; ASPSESSIONIDASDSBSBD=CJJELJMAIPJNEKHHDGKMKBKG; ASPSESSIONIDCCCTSBRQ=JBOKAKCBHFPAJIMHIMIAGKCK; ASPSESSIONIDCQTRTBTB=CPKDDAEDJFPIJDIFHBGCKOJN; ASPSESSIONIDASTSRARD=DPOHGAEDLMGHOKFADBJEMFPF; PAGINA_SAUDE=R3148930414; ASPSESSIONIDCQTSRARC=FJADIAEDKIGNDGMLIBOPJDBC' 
// -H 'Connection: keep-alive' 
// -H 'Cache-Control: no-cache' 
// --compressed