const exec = require ('child_process').exec

const curlcmd = '/usr/bin/curl -X '

const request = require('request')

var driver = null
module.exports = {

    loadDriver : function( db ) {
        if ( db === 'couch') {
            driver = require('./couch-driver')
        } else if ( db === 'mongo') {
            console.log('mongodb driver not implemented')
        }
    },

    getPrinters : function( callback ) {
        driver.getPrinters(callback)
    },

    getPrinter : function( id, callback ) {
        //curl -X GET http://127.0.0.1:5984/printers/{_id}
    },

    deletePrinter: function( p_name, id, rev, callback ) {
        driver.deletePrinter( p_name, id, rev, callback)
    },

    getUuid: function (callback) {
        //curl -X GET http://127.0.0.1:5984/_uuids
    },

    addPrinter: function( p_name, p_port, callback ) {

        driver.addPrinter(p_name, p_port, callback )
    }
}
