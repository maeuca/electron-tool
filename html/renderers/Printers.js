'use strict'
const $jq = global.jQuery = require('../js/jquery.min')
const Renderer = require('./Renderer')
const electron = require('electron')
const ipcRenderer = electron.ipcRenderer

global.counter = 0
var printers_list = {}

class Printers extends Renderer {
    constructor() {
        super()
        console.log('renderers/printers required-' + ++counter)
        ipcRenderer.on('initialize', (event,data) => {
            console.log('initialize received')
            refreshPrintersList()
        })

        // ipc events
        ipcRenderer.on('printers', (event,data) => {

            var data_obj = JSON.parse(data)

            printers_list = data_obj.rows
            $jq('#printer-add-panel').css('display','none')
            $jq('#printers-panel').css('display','block')
            $jq('#printer_name').val('')
            $jq('#printer_port').val('')
            $jq('#printers_filter').val('')
            displayRows(printers_list)

        })

        ipcRenderer.on('refresh', (event,data) => {

            refreshPrintersList()

        })
    }

    add(event) {
        event.preventDefault()
        $jq('#printers-panel').css('display','none')
        $jq('#printer-add-panel').css('display','block')
    }

    cancel(event) {
        event.preventDefault()
        $jq('#printer-add-panel').css('display','none')
        $jq('#printers-panel').css('display','block')
    }

    save(event) {
        event.preventDefault()
        console.log('saving new printer')

        var printer_name = $jq('#printer_name').val()
        var printer_port = $jq('#printer_port').val()

        ipcRenderer.send('printer-add', { printer_name:printer_name, printer_port:printer_port} )
    }

    home() {
        ipcRenderer.send('load-content',{content:'printers'})
    }


    remove( ndx ) {
        var printer = printers_list[ndx]

        if ( confirm('Delete ' + printer.value['printer_name']) ) {
            console.log( 'do delete')
            ipcRenderer.send('printer-delete', { printer_name: printer.value['printer_name'], rev:printer.value['_rev'], id: printer.value['_id'] } )
        }
    }

    printers() {
        refreshPrintersList()
    }
    filterRows( p_field ) {

        $jq('#printers-panel .list-group .list-group-item').remove()
        $jq.each(printers_list, (index,printer ) => {
            console.log('filter ' + printer.value['printer_name'] + ' with ' + printer.value['port'])
            console.log('matching name ' + p_field.value + ' with ' + printer.value['printer_name'] + ' or ' + printer.value['port'] )
            try {
                var hasname = printer.value['printer_name'].indexOf(p_field.value)
                var hasport = printer.value['port'].indexOf(p_field.value)
                if ( hasname > -1 || hasport > -1 ) {
                   $jq('#printers-panel .list-group').append( getListGroupItem( index ) )
                }
            } catch(err) {
                console.log('error at ' +  p_field.value + ' with ' + printer.value['printer_name'] + ' or ' + printer.value['port'])
            }

        });

    }
}






// methods exported to html screen

// Private and mapped Methpds
function refreshPrintersList() {
    $jq('#printers-panel .list-group .list-group-item').remove()
    ipcRenderer.send('printers-list')
}

function getListGroupItem( ndx  ) {
    var printer = printers_list[ndx];
    return  '<tr class="list-group-item" xmlns="http://www.w3.org/1999/html"> ' +
        '<td><span class="icon icon-trash" margin:6px" onclick="renderer.remove(' + ndx + ' )"></span></td>' +
        '<td>' + printer.value['printer_name'] + '</td><td>' + printer.value['port'] + '</td>' +
        '</tr>'
}


function displayRows( rows ) {
    $jq('#printers-panel .list-group .list-group-item').remove()
    $jq.each(rows, function(index,printer ) {
        $jq('#printers-panel .list-group').append( getListGroupItem( index ) )
    })
}

module.exports = Printers