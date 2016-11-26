const electron = require('electron')
const printerUtils = require('../lib/printerUtils')
const ipcMain = electron.ipcMain
const debug = require('debug')('print:ipc')

printerUtils.loadDriver('couch')

ipcMain.on('printers-list', (event, data) => {

    printerUtils.getPrinters( (data) => {
        global.mainWindow.webContents.send('printers', data)
    })
})
ipcMain.on('restart-request', () => {
    console.log('restart-request received')
    global.authsession.execute('/NDI-Node/restartNDI.sh')
})
ipcMain.on('printer-delete',(event, data) => {

    printerUtils.deletePrinter(data.printer_name, data.id, data.rev,  function(data) {
        debug(data.printer_name +' Deleted')
        global.mainWindow.webContents.send('notify', {title:'Printers', message:data.printer_name +' Deleted', icon:'print-icon.png', page:'info'})
        global.mainWindow.webContents.send('refresh')
    })
})

ipcMain.on('printer-add', (event, data) => {

    printerUtils.addPrinter(data.printer_name, data.printer_port,  function(data) {
        debug(data.printer_name +' Added')
        global.mainWindow.webContents.send('notify', {title:'Printers', message:data.printer_name +' Added', icon:'print-icon.png', page:'info'})
        global.mainWindow.webContents.send('refresh')
    })
})