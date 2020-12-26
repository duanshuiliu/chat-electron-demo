let uid      = ipcRenderer.sendSync("session", "uid");
let username = ipcRenderer.sendSync("session", "username");

$(".kl-kelvin").MyChattool({
    userId: uid,
    username: username,
    websocketUrl: 'ws://192.168.1.14:13000/chat',
});

$(".kl-body-user .header .info-name").text(username);