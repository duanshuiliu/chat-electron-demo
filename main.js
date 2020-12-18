const { app, BrowserWindow } = require('electron')
var router = require("./src/routers/router")

app.whenReady().then(() => {
    router.createWindow()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        router.createWindow()
    }
})