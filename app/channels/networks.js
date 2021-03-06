const electron = require('electron')
const stor = require('electron-storage')
const path = require('path')
const debug = require('debug')('print:ipc')
const ipcMain = electron.ipcMain


ipcMain.on('networks-list', (event, data) => {

    debug('networks-list received')
    stor.get('networks').then(function (stordata ) {
        global.mainWindow.webContents.send('networks', stordata)
   })
})

ipcMain.on('network-delete', (event, data) => {

    var network_name = data.network_name
    debug('network-delete received for ' + network_name)
    stor.get('networks').then( (stordata ) => {
        delete stordata[data.network_name]


        stor.set('networks', stordata, (err) => {
            if (err) {
                debug('network-delete:error in stor.set networks:' + err)
            }
            global.mainWindow.webContents.send('notify', {title:'Network', message:data.network_name +' Deleted' ,icon:'print-icon.png'})
            global.mainWindow.webContents.send('refresh')

        })
    }).catch( (err) => {

        debug('network-delete:error in stor.set networks:' + err)
    })
})

ipcMain.on('network-add', (event, data) => {

    debug('network-add received: ' + JSON.stringify(data))
    stor.get('networks').then( (stordata ) => {
        stordata[data.network_name] = data


        stor.set('networks', stordata, (err) => {
            if ( err) {
                debug('network-add:error in stor.set networks:' + err)
            }
            global.mainWindow.webContents.send('notify', {title:'Network', message:data.network_name +' Added' ,icon:'print-icon.png'})
            global.mainWindow.webContents.send('refresh')
        })
    }).catch( (err) => {
        var networks = {}
        networks[data.network_name] = data
        stor.set('networks', networks, (err) => {
            if ( err) {
                debug('network-add:error in stor.set networks:' + err)
            }
            global.mainWindow.webContents.send('notify', {title:'Network', message:data.network_name +' Added' ,icon:'print-icon.png'})
            global.mainWindow.webContents.send('refresh')

        })
    })

})