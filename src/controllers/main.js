let uid      = ipcRenderer.sendSync("session", "uid");
let username = ipcRenderer.sendSync("session", "username");

$(".kl-kelvin").MyChattool({
    userId: uid,
    username: username,
});

$(".kl-body-user .header .header-title").text(username);