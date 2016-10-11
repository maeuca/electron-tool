'use strict'
const notifier = require('electron-notifications')
const electron = require('electron')
const ipcRenderer = electron.ipcRenderer
const remote = electron.remote
const os = require('os')

global.apphome = process.cwd()

class Renderer {
    constructor() {
        console.log ('new Renderer class')

        ipcRenderer.on('notify', function(event,message) {

            console.log('notify received for ' + message.info)
            showNotify(message)

        })
    }


    navigate( page ) {
        ipcRenderer.send('load-content',{content:page})
    }



   openFile () {
       remote.shell.showItemInFolder( os.homedir() )
    }
    quit() {
        remote.app.quit()
    }

    logout() {
        ipcRenderer.send('logout')
    }
}

var showNotify = function( message ) {

    console.log('notify ' + global.apphome + '/' + message.icon)
    const notification = notifier.notify(message.title, {
        message: message.message,
        icon: global.apphome + '/html/' + message.icon,
        buttons: ['Dismiss'],
    })

    notification.on('clicked',function() {

    })
    notification.on('buttonClicked', function(button) {
        if ( button === 'Dismiss') {
            notification.close()
        } else if ( button === 'Info') {
            navigate( message.page )
        }
    })
}
module.exports = Renderer


