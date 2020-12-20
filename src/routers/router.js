const { ipcMain, BrowserWindow } = require("electron")
const path = require('path')

var appPath   = __dirname+"/../../"
var viewsPath = appPath+"src/views/"

ipcMain.on("jump", (event, page, command) => {
    switch (page) {
        case "main":
            // createWindow("main", 1063, 738);
            createWindow("main", 850, 580);
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

ipcMain.on("window", (event, command) => {
    var win = BrowserWindow.fromId(event.sender.id)
    console.log(win)
    
    switch (command) {
        case 'close':
            win.close()
            break;
        case 'min':
            win.minimize();
            break;
        case 'toggle-max':
            if (win.isMaximized()) {
                win.restore();
            } else {
                win.maximize();
            }
            break;
        case 'toggle-top':
            win.setAlwaysOnTop(!win.isAlwaysOnTop());
            break;
    }
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