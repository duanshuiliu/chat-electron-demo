let $msgContainer = $("#msg-container");

$("#user-container li").click(function() {
    let $target = $(this);
    let uid  = $target.attr("data-uid");
    let name = $target.attr("data-name");

    $target.addClass("user-brief-bgcolor").siblings().removeClass("user-brief-bgcolor");
    $msgContainer.find(".title-name").text(name);
});