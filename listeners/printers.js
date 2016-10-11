const electron = require('electron')
const printerUtils = require('../lib/printerUtils')
const ipcMain = electron.ipcMain

printerUtils.loadDriver('couch')

ipcMain.on('printers-list', function(event, data) {

    printerUtils.getPrinters( function(data) {
        global.mainWindow.webContents.send('printers', data)
    })
})

ipcMain.on('printer-delete', function(event, data) {

    printerUtils.deletePrinter(data.printer_name, data.id, data.rev,  function(data) {
        console.log(data.printer_name +' Deleted')
        global.mainWindow.webContents.send('notify', {title:'Printers', message:data.printer_name +' Deleted', icon:'print-icon.png', page:'info'})
        global.mainWindow.webContents.send('refresh')
    })
})

ipcMain.on('printer-add', function(event, data) {

    printerUtils.addPrinter(data.printer_name, data.printer_port,  function(data) {
        console.log(data.printer_name +' Added')
        global.mainWindow.webContents.send('notify', {title:'Printers', message:data.printer_name +' Added', icon:'print-icon.png', page:'info'})
        global.mainWindow.webContents.send('refresh')
    })
})