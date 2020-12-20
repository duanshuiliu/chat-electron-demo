$("#login-form").submit(function() {
    // TODO 验证是否正确

    ipcRenderer.send("jump", "main", "close")
    return false;
});

$("#win-setting").click(function() {
    layui.use('layer', function(){
        var layer = layui.layer;

        layer.msg("功能暂未开发，敬请期待");
      });
});