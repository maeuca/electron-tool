const os = require('os')
const $jq = global.jQuery = require('../js/jquery.min')
const electron = require('electron')
const Renderer = require('./Renderer')
const ipcRenderer = electron.ipcRenderer
const notifier = require('electron-notifications')

var networks = {}
class Login extends Renderer {
    constructor() {
        super()
        ipcRenderer.on('authenticate-response', (event,data) => {
            if ( data.status=='Session Ready') {
                console.log('authenticate-response received:' + data.status)
                ipcRenderer.send('load-content',{content:'printers'})
            }
        })

        ipcRenderer.on('initialize', (event,data) => {
            console.log('initialize received')
            ipcRenderer.send('networks-list')
        })

        ipcRenderer.on('networks', (event,data) => {
            networks = data
            var selectList = '<select id="network_name"><option value="null" selected>Select Network</option>'
            for ( var network_name in networks) {
                var network = networks[network_name]
                selectList += '<option value="'+ network_name + '">' + network_name + '</option>'
            }
            selectList += '</select>'

            $jq('#networks').html( selectList )
        })

    }

    authenticate () {
        var username = document.getElementById('username').value
        var password = document.getElementById('password').value
        var network_name = document.getElementById('network_name').value

        ipcRenderer.send('authenticate-request', {network:networks[network_name], username:username, password:password})


    }
}

module.exports = Login




