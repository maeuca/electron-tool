const exec = require ('child_process').exec

const curlcmd = '/usr/bin/curl -X '

const request = require('request')

module.exports = {


    getPrinters : function( callback ) {
        console.log('calling getPrinters ')
        //curl -X GET http://127.0.0.1:5984/printers/_design/printer/_view/all
        request.get('http://127.0.0.1:5984/printers/_design/printer/_view/all', function (error, response, body) {
            if (!error && response.statusCode == 200) {
               callback(body)
            }
        })
    },

    getPrinter : function( id, callback ) {
        //curl -X GET http://127.0.0.1:5984/printers/{_id}
    },

    deletePrinter: function( p_name, id, rev, callback ) {
        console.log('deletePrinter: http://127.0.0.1:5984/printers/' + id + '?rev=' + rev)
        var url =
        request.delete('http://127.0.0.1:5984/printers/' + id + '?rev=' + rev , function (error, response, body) {
            if (!error && response.statusCode == 200) {
                callback({status: response.statusCode, printer_name: p_name})
            }
            else {
                callback({status: response.statusCode,  printer_name: p_name, error: error})
            }
        })
        //curl -X DELETE http://127.0.0.1:5984/printers/{_id}?rev={rev}
    },

    getUuid: function (callback) {
        //curl -X GET http://127.0.0.1:5984/_uuids
    },

    addPrinter: function( p_name, p_port, callback ) {

        request.get('http://127.0.0.1:5984/_uuids', function (error, response, body) {
            var data_obj = JSON.parse(body)
            if (!error && response.statusCode == 200) {
                var uuid =  data_obj.uuids[0];

                var options = {
                    url: 'http://127.0.0.1:5984/printers/' + uuid,
                    method: 'PUT',
                    json: {
                        printer_name: p_name,
                        _id: uuid,
                        device_id: 0,
                        port: p_port,
                        processed:0,
                        errors:0,
                        lastjobid:0,
                        last_jobtimestamp:0
                    }
                }
                console.log('add a printer ' + JSON.stringify(options))
                request(options, function (error, response, body) {
                    console.log('add request returned ' + JSON.stringify(body))
                    if (!error && response.statusCode == 200) {
                        callback({status: response.statusCode, printer_name: p_name})
                    } else {
                        callback({status: response.statusCode,  printer_name: p_name, error: error})
                    }
                })
            } else {
                callback({status: response.statusCode,  printer_name: p_name, error: error})
            }

        })
        // curl -X PUT http://127.0.0.1:5984/printers/{uuid} -d
        // '{"printer_name":"{name}","_id":"{uuid}", "device_id":0,"port":"{port}","processed":0,"errors":0,"last_jobid":0,"last_jobtimestamp":0}'

    }
}
