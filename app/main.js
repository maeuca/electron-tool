const electron = require('electron')
// DEBUG=print:* npm start
const debug = require('debug')('print:main')

const ipcMain = electron.ipcMain
const BrowserWindow = electron.BrowserWindow
const headers = {}

debug('start up...')

global.apphome = process.cwd()
global.authsession = null
global.mainWindow = null

require('./channels/ipc')

function createMainWindow(page) {

    global.mainWindow = new BrowserWindow({
            width: 710,
            height: 600,
            backgroundColor: 'white',
            frame: true,
            transparent: false
    })

    //global.mainWindow.webContents.openDevTools()
    global.mainWindow.on('closed', function () {
        debug('closing')
        ipcMain.removeAllListeners()
        global.mainWindow = null
    })


    // Send the Initialze event to the Screen
    global.mainWindow.webContents.on('dom-ready', function (event) {
        debug('dom-ready event')
        global.mainWindow.webContents.send('initialize')
    })

    global.mainWindow.webContents.loadURL("file://" + global.apphome + '/html/' + page + '.html', headers)
    global.mainWindow.show()
}

function appReady() {

    var trayimage = electron.nativeImage.createFromPath(global.apphome + '/html/print-icon.png')
    trayimage.setTemplateImage(true)
    var appIcon = new electron.Tray(trayimage)

    appIcon.on('click', function() {
        if ( global.mainWindow == null ) {
            createMainWindow( 'printers' )
        } else {
            global.mainWindow.show();
        }

    })
    createMainWindow('login')
    debug ('app ready')
}


var shouldQuit = electron.app.makeSingleInstance( function(cmd, dir) {
    if (  global.mainWindow) {
        if (  global.mainWindow.isMinimized()) mainWindow.restore();
        global.mainWindow.focus()
    }
})

if ( shouldQuit ) {
    electron.app.quit()
}


electron.app.on('ready', appReady)

electron.app.on('activate', function() {
    debug('electron is active')
})


ipcMain.on('renderer-started', function(event, data) {
    debug('renderer-started received')
})


ipcMain.on('load-content', function(event,data) {
    var hasSession =  (global.authsession == null) ? false: true
    debug('load-content received for ' + data.content + ' / ' + hasSession )
    if ( hasSession && data.content === 'login' ) {
        data.content = 'printers'
    }

    global.mainWindow.webContents.loadURL("file://" + global.apphome + '/html/' + data.content + '.html', headers)
})
