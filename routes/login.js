var express = require('express');
var router = express.Router();
var infra = require('./../common/infra.js');
var processor = require('./../common/processor.js');
var request = require("request");
var url = require('url');

router.get('/', function (req, res) {
    infra.timming("startProcess", () => {
        var usuario = req.header("usuario");
        var senha = req.header("senha");
        
        var options = { 
            method: 'POST',
            url: 'https://wwws.bradescosaude.com.br/logcorp/valida100Corretor.asp',
            time: true,
            qs: { 'Content-Type': 'application/x-www-form-urlencoded' },
            headers: { 
                'cache-control': 'no-cache',
                'content-type': 'application/x-www-form-urlencoded' 
            },
            form: { 
                arearet: 'areageral',
                servico: '8',
                id_cia: '1',
                btnCorretor: 'ok',
                origem: 'AC',
                CGCCPF: usuario,
                SENHA: senha 
            } 
        };

        infra.timming("firstRequest", () => {
            request(options, function (error, response, body) {
                if (error) throw new Error(error);

                if (response.statusCode === 302) {
                    
                    var opts = {
                        url: response.headers.location,
                        time: true
                    };
                    
                    infra.timming("secondRequest", () => {
                        request(opts, function (error2, response2, body2) {
                            if (error2) throw new Error(error2);

                            if (response2.statusCode === 200) {
                                infra.timming("processorHtml", () => {
                                    processor.html(body2, (err, window) => {
                                        //console.log(body2);
                                        //Use jQuery just as in a regular HTML page
                                        var $ = require('jquery')(window);

                                        // var arrInputs = [];
                                        // var arrForms = [];
                                        
                                        // $('form').each(function(index, item){
                                        //     var form = { 
                                        //         name: item.name,
                                        //         action: item.action,
                                        //         method: item.method,
                                        //         inputs: []
                                        //     };

                                        //     $(this.name+':input').each(function(ind, inputItem){
                                        //         var input = { 
                                        //             name: inputItem.name,
                                        //             value: inputItem.value
                                        //         };
                                        //         if ($.grep(form.inputs, function(e){ return e.name == inputItem.name}).length === 0)
                                        //             form.inputs.push(inputItem);
                                        //     });

                                        //     if ($.grep(arrForms, function(e){ return e.name == form.name}).length === 0)
                                        //         arrForms.push(form);
                                        // });

                                        // $(':input').each(function(index, item){
                                        //     var input = { 
                                        //         name: item.name,
                                        //         value: item.value
                                        //     };
                                        //     if ($.grep(arrInputs, function(e){ return e.name == input.name}).length === 0)
                                        //         arrInputs.push(input);
                                        // });

                                        var ctrl_ps = infra.parseURL(response.headers.location).searchObject.ctrl_ps;

                                        var result = {
                                            email: $('input:hidden[name=email]').val(),
                                            ctrl: $('input:hidden[name=ctrl]').val(),
                                            ctrl_ps: ctrl_ps,
                                            cod_usuario: $('input:hidden[name=cd_usuario]').val(),
                                            nome: $('input:hidden[name=nome]').val(),
                                            cgccpf: $('input:hidden[name=cd_cgccpf]').val(),
                                            tipo_usuario: $('input:hidden[name=tp_usuario]').val()
                                        };

                                        // var result = {
                                        //     inputs: arrInputs,
                                        //     forms: arrForms,
                                        //     fields: null
                                        // }

                                        res.header('X-Forwarded-Location', response.headers.location);
                                        res.type('json');
                                        res.end(JSON.stringify(result));
                                    });
                                });
                            }

                            console.log('Request time in ms', response2.elapsedTime);
                        });
                    });
                    
                }
                else if (response.statusCode === 200) {
                        processor.html(body2, (err, window) => {
                                //Use jQuery just as in a regular HTML page
                                var $ = require('jquery')(window);

                                var obj = {
                                    email: $('input:hidden[name=email]').val(),
                                    ctrl: $('input:hidden[name=ctrl]').val(),
                                    cod_usuario: $('input:hidden[name=cd_usuario]').val(),
                                    nome: $('input:hidden[name=nome]').val(),
                                    cgccpf: $('input:hidden[name=cd_cgccpf]').val(),
                                    tipo_usuario: $('input:hidden[name=tp_usuario]').val()
                                };

                                //console.log(user);
                                res.header('X-Forwarded-Location', response.headers.location);
                                res.type('json');
                                res.end(JSON.stringify(obj));
                        });

                    console.log(body);
                }
                
                console.log('Request time in ms', response.elapsedTime);
            });
        });
    });
});

module.exports = router;