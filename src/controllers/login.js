$("#login-form").submit(function() {
    // TODO 验证是否正确

    ipcRenderer.send("jump", "main", "close")
    return false;
});