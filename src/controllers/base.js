const { ipcRenderer } = require("electron");

$("#close").click(function() {
    ipcRenderer.send("close", "");
});