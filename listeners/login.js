const electron = require('electron')
const ipcMain = electron.ipcMain
const auth = require('../lib/authSession')
const debug = require('debug')('print:ipc')

ipcMain.on('authenticate-request', function(event, data) {
    var network = data.network
    debug('authenticate start ' + data.username + '@' + data.network['network_name'])
    global.authsession = new auth.AuthSession(data.username,data.password,data.network)
    global.authsession.authenticate()
    global.authsession.once('forward-ready', function() {
        event.sender.send('authenticate-response', {status:'Session Ready'} )
    })
    global.authsession.once('connection-error', function( error ) {
        global.mainWindow.webContents.send('notify', {title:'Login Failed', message:error.status , info:'Connection Error', icon:'print-icon.png', page:'info'})
    })
})

ipcMain.on('logout', function(event, data) {
   debug('logout')

    if ( global.authsession != null ) {
        global.authsession.shutdown()
        global.authsession = null
    }
    global.mainWindow.webContents.loadURL("file://" + global.apphome + '/html/login.html', {})

})
debug('login listener ready')