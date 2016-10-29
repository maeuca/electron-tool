'use strict'
const Renderer = require('./Renderer')
const electron = require('electron')
const ipcRenderer = electron.ipcRenderer

global.counter = 0
var networks = {}

class Networks extends Renderer {
    constructor() {
        super()
        console.log('renderers/networks required-' + ++counter)

        ipcRenderer.on('initialize', (event,data) => {
            console.log('initialize received')
            refreshNetworksList()
        })

        // ipc events
        ipcRenderer.on('networks', (event,data) => {

            networks = data
            console.log('networks data recevied: ' + JSON.stringify(networks))
            jQuery('#network-add-panel').css('display','none')
            jQuery('#networks-panel').css('display','block')
            jQuery('#network_name').val('')
            jQuery('#network_port').val('')
            jQuery('#networks_filter').val('')
            displayRows(networks)

        })

        ipcRenderer.on('refresh', (event,data) => {
            refreshNetworksList()
        })
    }

    add(event) {
        event.preventDefault()
        jQuery('#networks-panel').css('display','none')
        jQuery('#network-add-panel').css('display','block')
    }

    edit( network_name) {

        var network = networks[network_name]
        console.log('edit ' + network['network_name'] )
        jQuery('#networks-panel').css('display','none')
        jQuery('#network-add-panel').css('display','block')
        jQuery('#network_name').val(network['network_name'] )
        jQuery('#external_ip').val(network['external_ip'] )
        jQuery('#internal_ip').val(network['internal_ip'])
        jQuery('#service_port').val(network['service_port'])
        jQuery('#driver').val(network['driver'])
    }

    cancel(event) {
        event.preventDefault()
        jQuery('#network-add-panel').css('display','none')
        jQuery('#networks-panel').css('display','block')
    }

    save(event) {
        event.preventDefault()
        console.log('saving new network')

        var network_name = jQuery('#network_name').val()
        var external_ip = jQuery('#external_ip').val()
        var internal_ip = jQuery('#internal_ip').val()
        var service_port = jQuery('#service_port').val()
        var driver = jQuery('#driver').val()

        ipcRenderer.send('network-add', {
            network_name:network_name,
            external_ip:external_ip,
            internal_ip:internal_ip,
            service_port:service_port,
            driver:driver
        } )
    }

    home() {
        ipcRenderer.send('load-content',{content:'networks'})
    }


    remove( network_name ) {
       console.log('remove ' + network_name )

        if ( confirm('Delete ' + network_name) ) {
            console.log( 'do delete')
            var network
            ipcRenderer.send('network-delete', { network_name: network_name } )
        }
    }

    networks() {
        refreshNetworksList()
    }
    filterRows( p_field ) {

        jQuery('#networks-panel .list-group .list-group-item').remove()
        for ( var network_name in networks )
        {
            var network = networks[network_name]
            console.log('matching name ' + p_field.value + ' with ' + network_name)
            try {
                var hasname = network_name.indexOf(p_field.value)
                if ( hasname > -1 ) {
                    jQuery('#networks-panel .list-group').append( getListGroupItem( network ) )
                }
            } catch(err) {
                console.log('error at ' +  p_field.value + ' with ' + network_name)
            }

        }

    }
}


// Private Methpds
function refreshNetworksList() {
    jQuery('#networks-panel .list-group .list-group-item').remove()
    ipcRenderer.send('networks-list')
}



function getListGroupItem( network ) {
    return  '<tr class="list-group-item" xmlns="http://www.w3.org/1999/html"> ' +
        '<td><span class="icon icon-trash" margin:6px" onclick="renderer.remove(\'' + network['network_name']  + '\' )"></span></td>' +
        '<td><span class="icon icon-pencil" margin:6px" onclick="renderer.edit(\'' + network['network_name']  + '\' )"></span></td>' +
        '<td>' + network['network_name'] + '</td><td>' + network['external_ip'] +  '</td>' +
        '</tr>'
}


function displayRows( rows ) {
    jQuery('#networks-panel .list-group .list-group-item').remove()
    for ( var network_name in rows )
    {
        var network = rows[network_name]
        jQuery('#networks-panel .list-group').append( getListGroupItem( network ) )
    }
}
module.exports = Networks