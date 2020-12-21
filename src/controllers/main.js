let $msgContainer = $("#msg-container");

$("#user-container li").click(function() {
    let $target = $(this);
    let uid  = $target.attr("data-uid");
    let name = $target.attr("data-name");

    console.log($target, $(this));

    $msgContainer.find(".title-name").text(name);
});