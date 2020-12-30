$("#login-form").submit(function() {
    let username = $(this).find(":input[name='username']").val();
    let password = $(this).find(":input[name='password']").val();

    let usernameReg = /^\w+$/;
    if (!usernameReg.test(username)) {
        layer.msg("用户名必须是字母、数字、下划线");
        return false;
    }

    // TODO 验证是否正确

    let cookie = {
        username: username,
        uid     : Math.floor((new Date()).getTime()/1000),
        token   : "",
    };

    ipcRenderer.send("login", cookie);
    return false;
});

$("#win-setting").click(function() {
    layer.msg("功能暂未开发，敬请期待");
});