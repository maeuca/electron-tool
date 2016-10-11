const electron = require('electron')

const ipcMain = electron.ipcMain
const BrowserWindow = electron.BrowserWindow
const headers = {}

console.log('start up...')

global.apphome = process.cwd()
global.authsession = null
global.mainWindow = null

require('./listeners/ipc')

function createMainWindow(page) {

    global.mainWindow = new BrowserWindow({
            width: 355,
            height: 600,
            backgroundColor: 'white',
            frame: true,
            transparent: false
    })

    //global.mainWindow.webContents.openDevTools()
    global.mainWindow.on('closed', function () {
        console.log('closing')
        global.mainWindow = null
    })
    global.mainWindow.on('page-title-updated', function (event) {
        console.log('page title is updated')
    })

    global.mainWindow.webContents.on('dom-ready', function (event) {
        console.log('dom-ready event')
        global.mainWindow.webContents.send('initialize')
    })
    global.mainWindow.webContents.on('did-finish-load', function (event) {
        console.log('mainWindow did finish load')
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
    console.log('appReady')
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
    console.log('html is active')
})


ipcMain.on('renderer-started', function(event, data) {
    console.log('renderer-started received')
})


ipcMain.on('load-content', function(event,data) {
    var hasSession =  (global.authsession == null) ? false: true
    console.log('load-content received for ' + data.content + ' / ' + hasSession )
    if ( hasSession && data.content === 'login' ) {
        data.content = 'printers'
    }

    global.mainWindow.webContents.loadURL("file://" + global.apphome + '/html/' + data.content + '.html', headers)
})







