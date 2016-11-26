'use strict'

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
            jQuery('#printer-add-panel').css('display','none')
            jQuery('#printers-panel').css('display','block')
            jQuery('#printer_name').val('')
            jQuery('#printer_port').val('')
            jQuery('#printers_filter').val('')
            displayRows(printers_list)

        })

        ipcRenderer.on('refresh', (event,data) => {

            refreshPrintersList()

        })
    }

    restart() {

        if ( confirm('Restart Printers Service?') ) {
            console.log( 'do delete')
            ipcRenderer.send('restart-request')
        }
    }
    add(event) {
        event.preventDefault()
        jQuery('#printers-panel').css('display','none')
        jQuery('#printer-add-panel').css('display','block')
    }

    cancel(event) {
        event.preventDefault()
        jQuery('#printer-add-panel').css('display','none')
        jQuery('#printers-panel').css('display','block')
    }

    save(event) {
        event.preventDefault()
        console.log('saving new printer')

        var printer_name = jQuery('#printer_name').val()
        var printer_port = jQuery('#printer_port').val()

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

        jQuery('#printers-panel .list-group .list-group-item').remove()
        jQuery.each(printers_list, (index,printer ) => {
            console.log('filter ' + printer.value['printer_name'] + ' with ' + printer.value['port'])
            console.log('matching name ' + p_field.value + ' with ' + printer.value['printer_name'] + ' or ' + printer.value['port'] )
            try {
                var hasname = printer.value['printer_name'].indexOf(p_field.value)
                var hasport = printer.value['port'].indexOf(p_field.value)
                if ( hasname > -1 || hasport > -1 ) {
                    jQuery('#printers-panel .list-group').append( getListGroupItem( index ) )
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
    jQuery('#printers-panel .list-group .list-group-item').remove()
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
    jQuery('#printers-panel .list-group .list-group-item').remove()
    jQuery.each(rows, function(index,printer ) {
        jQuery('#printers-panel .list-group').append( getListGroupItem( index ) )
    })
}

module.exports = Printers