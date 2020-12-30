let uid      = ipcRenderer.sendSync("session", "uid");
let username = ipcRenderer.sendSync("session", "username");

$(".kl-kelvin").MyChattool({
    userId: uid,
    username: username,
    websocketUrl: 'ws://192.168.92.32:13000/chat',
});

$(".kl-body-user .header .info-name").text(username);