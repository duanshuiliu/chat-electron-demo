const { create } = require("domain")
const { ipcMain, BrowserWindow, session } = require("electron")
const path = require('path')

var appPath   = __dirname+"/../../"
var viewsPath = appPath+"src/views/"

// ipcMain.on("jump", (event, page, command) => {
//     switch (page) {
//         default:
//             createWindow();
//             break;
//     }

//     switch (command) {
//         case "close":
//             var win = BrowserWindow.fromId(event.frameId)
//             win.close()
//             break;
//     }

//     event.returnValue = "go"
// })

ipcMain.on("login", (event, data) => {
    console.log("login", data);

    let cookies = [];
    for(var i in data) {
        let temp = {};
        temp.url    = "http://www.kelvin.test";
        temp.name   = i;
        temp.value  = data[i].toString();
        temp.domain = ".www.kelvin.test";

        cookies.push(session.defaultSession.cookies.set(temp));
    }

    // 记录登录信息(cookie)
    Promise.all(cookies).then(function() {
        // 打开主页
        createWindow("main", 850, 580).then(function() {
            // 关闭当前页
            var win = BrowserWindow.fromId(event.sender.id);
            win.close();

        }).catch(function(err) {
            // 
        });
    }).catch(function(err) {
        console.log("login cookie set error", err);
    });
})

ipcMain.on("session", (event, key) => {
    session.defaultSession.cookies.get({ url: 'http://www.kelvin.test', name: key }).then(function(cookie) {
        event.returnValue = cookie[0].value;
    }).catch(function(err) {
        console.log("get session error", err);
        event.returnValue = false;
    });
})

ipcMain.on("window", (event, command) => {
    var win = BrowserWindow.fromId(event.sender.id)
    
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

// 登录验证
function checkLogin(page = "login") {
    return new Promise(function(resolve, reject) {
        if (page != "login") {
            session.defaultSession.cookies.get({ url: 'http://www.kelvin.test', name: "uid" }).then(function(cookie) {
                console.log("get cookie succes", cookie);

                if (cookie[0].value) {
                    resolve();
                } else {
                    reject("not get login info");
                }
            }).catch(function(err) {
                console.log("get cookie error", err);
                reject(err);
            });
        } else {
            console.log("enter login page");
            resolve();
        }
    });
}

/**
 * 创建窗口
 */
function createWindow (page = "login", width = 280, height = 400) {

    return new Promise(function(resolve, reject) {
        checkLogin(page).then(function() {
            const win = new BrowserWindow({
                width : width,
                height: height,
                frame : false,
                webPreferences: {
                    nodeIntegration: true,
                    preload: path.join(appPath, 'preload.js'),
                }
            })
        
            page = viewsPath+page+".html";
            win.loadFile(page);

            resolve();
    
        }).catch(function(err) {
            reject(err);
        });
    });
}

module.exports={
    createWindow,
}