const { ipcRenderer } = require("electron");

var layer = null;
layui.use('layer', function(){
    layer = layui.layer;
});

// 窗口 - 关闭
$("#win-close").click(function() {
    ipcRenderer.send("window", "close");
});
// 窗口 - 最小化
$("#win-min").click(function() {
    ipcRenderer.send("window", "min");
});
// 窗口 - 最大化/还原
$("#win-toggle-max").click(function() {
    ipcRenderer.send("window", "toggle-max");

    let $target = $(this).find("i");
    if ($target.hasClass("icon-max")) {
        $target.removeClass("icon-max").addClass("icon-max_restore");

    } else if ($target.hasClass("icon-max_restore")) {
        $target.removeClass("icon-max_restore").addClass("icon-max");
    }
});
// 窗口 - 置顶/取消置顶
$("#win-toggle-top").click(function() {
    ipcRenderer.send("window", "toggle-top");

    let $target = $(this).find("i");
    if ($target.hasClass("icon-pin")) {
        $target.removeClass("icon-pin").addClass("icon-pin_slash");

    } else if ($target.hasClass("icon-pin_slash")) {
        $target.removeClass("icon-pin_slash").addClass("icon-pin");
    }
});