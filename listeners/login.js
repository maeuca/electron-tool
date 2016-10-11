const electron = require('electron')
const ipcMain = electron.ipcMain
const auth = require('../lib/authSession')

ipcMain.on('authenticate-request', function(event, data) {
    var network = data.network
    console.log('authenticate start ' + data.username + ':' + data.password + '@' + data.network['network_name'])
    global.authsession = new auth.AuthSession(data.username,data.password,data.network)
    global.authsession.authenticate()
    global.authsession.on('forward-ready', function() {
        console.log('authenticate completed and forward is ready for requests')
        event.sender.send('authenticate-response', {status:'Session Ready'} )
    })

})

ipcMain.on('logout', function(event, data) {
    console.log('logout')

    global.authsession.shutdown()
    global.mainWindow.webContents.loadURL("file://" + global.apphome + '/html/login.html', {})
    global.authsession = null

})
console.log('login listener ready')