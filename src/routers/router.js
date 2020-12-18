const { ipcMain, BrowserWindow } = require("electron")
const path = require('path')

var appPath   = __dirname+"/../../"
var viewsPath = appPath+"src/views/"

ipcMain.on("jump", (event, page, command) => {
    switch (page) {
        case "main":
            createWindow("main", 800, 600);
            break;
        default:
            createWindow();
            break;
    }

    switch (command) {
        case "close":
            var win = BrowserWindow.fromId(event.frameId)
            win.close()
            break;
    }

    
    event.returnValue = "go"
})

ipcMain.on("close", (event) => {
    var win = BrowserWindow.fromId(event.frameId)
    win.close()
})

/**
 * 创建窗口
 */
function createWindow (page = "login", width = 280, height = 400) {
    const win = new BrowserWindow({
        width : width,
        height: height,
        frame : false,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(appPath, 'preload.js'),
        }
    })

    page = viewsPath+page+".html"
    win.loadFile(page)
}

module.exports={
    createWindow,
}