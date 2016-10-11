const electron = require('electron')
const stor = require('electron-storage')
const path = require('path')

const ipcMain = electron.ipcMain


ipcMain.on('networks-list', function(event, data) {

    console.log('networks-list received')
    stor.get('networks').then(function (stordata ) {
       global.mainWindow.webContents.send('networks', stordata)
   })
})

ipcMain.on('network-delete', function(event, data) {

    var network_name = data.network_name
    console.log('network-delete received for ' + network_name)
    stor.get('networks').then(function (stordata ) {
        delete stordata[data.network_name]


        stor.set('networks', stordata, function(err) {
            if (err) {
                console.log('network-delete:error in stor.set networks:' + err)
            }
            global.mainWindow.webContents.send('notify', {title:'Network', message:data.network_name +' Deleted' ,icon:'print-icon.png'})
            global.mainWindow.webContents.send('refresh')

        })
    }).catch( function(err) {

            console.log('network-delete:error in stor.set networks:' + err)
    })
})

ipcMain.on('network-add', function(event, data) {

    console.log('network-add received: ' + JSON.stringify(data))
    stor.get('networks').then(function (stordata ) {
        stordata[data.network_name] = data


        stor.set('networks', stordata, function(err) {
            if ( err) {
                console.log('network-add:error in stor.set networks:' + err)
            }
            global.mainWindow.webContents.send('notify', {title:'Network', message:data.network_name +' Added' ,icon:'print-icon.png'})
            global.mainWindow.webContents.send('refresh')
        })
    }).catch( function(err) {
        var networks = {}
        networks[data.network_name] = data
        stor.set('networks', networks, function(err) {
            if ( err) {
                console.log('network-add:error in stor.set networks:' + err)
            }
            global.mainWindow.webContents.send('notify', {title:'Network', message:data.network_name +' Added' ,icon:'print-icon.png'})
            global.mainWindow.webContents.send('refresh')

        })
    })

})