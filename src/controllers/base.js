const { ipcRenderer } = require("electron");

$("#win-close").click(function() {
    ipcRenderer.send("window", "close");
});

$("#win-min").click(function() {
    ipcRenderer.send("window", "min");
});

$("#win-toggle-max").click(function() {
    ipcRenderer.send("window", "toggle-max");
});

$("#win-toggle-top").click(function() {
    ipcRenderer.send("window", "toggle-top");
});