'use strict'
const $jq = global.jQuery = require('../js/jquery.min')
const Renderer = require('./Renderer')
const electron = require('electron')
const ipcRenderer = electron.ipcRenderer

global.counter = 0
var networks = {}

class Networks extends Renderer {
    constructor() {
        super()
        console.log('renderers/networks required-' + ++counter)
        ipcRenderer.on('initialize', function(event,data) {
            console.log('initialize received')
            refreshNetworksList()
        })

        // ipc events
        ipcRenderer.on('networks', function(event,data) {

            networks = data
            console.log('networks data recevied: ' + JSON.stringify(networks))
            $jq('#network-add-panel').css('display','none')
            $jq('#networks-panel').css('display','block')
            $jq('#network_name').val('')
            $jq('#network_port').val('')
            $jq('#networks_filter').val('')
            displayRows(networks)

        })

        ipcRenderer.on('refresh', function(event,data) {

            refreshNetworksList()

        })
    }

    add(event) {
        event.preventDefault()
        $jq('#networks-panel').css('display','none')
        $jq('#network-add-panel').css('display','block')
    }

    edit( network_name) {

        var network = networks[network_name]
        console.log('edit ' + network['network_name'] )
        $jq('#networks-panel').css('display','none')
        $jq('#network-add-panel').css('display','block')
        $jq('#network_name').val(network['network_name'] )
        $jq('#external_ip').val(network['external_ip'] )
        $jq('#internal_ip').val(network['internal_ip'])
        $jq('#service_port').val(network['service_port'])
        $jq('#driver').val(network['driver'])
    }

    cancel(event) {
        event.preventDefault()
        $jq('#network-add-panel').css('display','none')
        $jq('#networks-panel').css('display','block')
    }

    save(event) {
        event.preventDefault()
        console.log('saving new network')

        var network_name = $jq('#network_name').val()
        var external_ip = $jq('#external_ip').val()
        var internal_ip = $jq('#internal_ip').val()
        var service_port = $jq('#service_port').val()
        var driver = $jq('#driver').val()

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

        $jq('#networks-panel .list-group .list-group-item').remove()
        for ( var network_name in networks )
        {
            var network = networks[network_name]
            console.log('matching name ' + p_field.value + ' with ' + network_name)
            try {
                var hasname = network_name.indexOf(p_field.value)
                if ( hasname > -1 ) {
                   $jq('#networks-panel .list-group').append( getListGroupItem( network ) )
                }
            } catch(err) {
                console.log('error at ' +  p_field.value + ' with ' + network_name)
            }

        }

    }
}


// Private Methpds
function refreshNetworksList() {
    $jq('#networks-panel .list-group .list-group-item').remove()
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
    $jq('#networks-panel .list-group .list-group-item').remove()
    for ( var network_name in rows )
    {
        var network = rows[network_name]
        $jq('#networks-panel .list-group').append( getListGroupItem( network ) )
    }
}
module.exports = Networks