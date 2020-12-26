;(function($, window, document, layui, undefined) {
    var MyChattool = function(ele, opt) {
        this.$element = ele;
        this.defaults = {
            'userId': 1,
            'username': '',
            'websocketUrl' : 'ws://192.168.92.32:13000/chat',
            'websocketClient': null,
            'max': 2000,
        };

        this.options = $.extend({}, this.defaults, opt);

        var _ = this;

        // websocket
        this.getWebsocketClient = function() {
            return new Promise(function(resolve, reject) {
                if ("WebSocket" in window) {
                    if (_.options.websocketClient) {
                        resolve();
                        return true;
                    }

                    let protocol = _.options.userId+"#"+_.options.username;
                    var ws = new WebSocket(_.options.websocketUrl, protocol);

                    ws.onopen = function() {
                        _.options.websocketClient = ws;
                        resolve();

                        // 发送账号信息
                        // let content = {name: _.options.username};
                        // _.sendWebsocketMsg(content, 10000);
                    };

                    ws.onmessage = function (evt) {
                        var msg = evt.data;
                        msg = eval("("+msg+")");

                        _.handleMessage(msg);
                    };

                    ws.onclose = function(){
                        _.options.websocketClient = null;

                        layui.use('layer', function(){
                            layer = layui.layer;
                            layer.alert("服务器连接关闭");
                        });
                    };

                    ws.onerror=function(event){
                        _.options.websocketClient = null;
                        console.log("websocket连接失败", event);

                        layui.use('layer', function(){
                            layer = layui.layer;
                            layer.alert("服务器连接关闭");
                        });
                    }
                } else {
                    reject("您的浏览器不支持 WebSocket!");
                }
            });
        };
        // 发送消息
        this.sendWebsocketMsg = function(content, type = 10001, kind = 1) {
            let sendMsg = {};
            sendMsg.type = type;
            sendMsg.kind = kind;
            sendMsg.data = content;
            
            _.options.websocketClient.send(JSON.stringify(sendMsg));
        };
        this.sendChatMsg = function($target) {
            let $chatRoom = $target.parents(".msg-chatroom");
            let content   = $chatRoom.find(".kl-content-edit").text();

            // 编辑区清空
            if (content) {
                $chatRoom.find(".kl-content-edit").text("");
            } else {
                layui.use('layer', function(){
                    layer = layui.layer;
                    layer.msg("发送内容不能为空");
                });
                return false;
            }

            // 发送消息 - 发送人
            let chatId   = $chatRoom.attr('data-chat-id');
            let chatType = $chatRoom.attr('data-chat-type');

            let sendMsg = {};
            sendMsg.receiver_id = parseInt(chatId);
            sendMsg.content     = content;

            _.sendWebsocketMsg(sendMsg, 10001);

            // 发送消息 - 自己
            let sendSelfMsg = {};
            sendSelfMsg.chat_id     = chatId;
            sendSelfMsg.chat_type   = 2;
            sendSelfMsg.sender_id   = _.options.userId;
            sendSelfMsg.sender_name = _.options.username;
            sendSelfMsg.content     = content;
            sendSelfMsg.time        = _.formatDate(Math.floor((new Date()).getTime()/1000));
            _.privateMsg(sendSelfMsg);
        };
        // 消息处理
        this.handleMessage = function(msg) {
            console.log(msg);
            switch (msg.type) {
                // 注册
                case 10000:
                    _.users(msg.data["users"]);
                    break;
                // 私聊
                case 10001:
                    _.privateMsg(msg.data);
                    break;
            }
        };
        // 用户渲染
        this.users = function(users) {
            let $container = $("#user-container");
            // $container.children().remove();

            for(var i in users) {
                if (users[i].chat_id != _.options.userId) {
                    let userClass = "user-brief-"+users[i].chat_type+"-"+users[i].chat_id;
                    let $user     = $container.find("."+userClass);

                    if ($user.length <= 0) {
                        let html = _.templateOfUser(users[i]);
                        $container.append(html);
                    }
                }
            }
        };
        // 消息渲染
        this.privateMsg = function(msg) {
            let $userContainer = $("#user-container");
            let $msgContainer  = $("#msg-container");

            let html = _.templateOfPrivateMsg(msg);

            let chatRoomClass = "chatroom-"+msg.chat_type+"-"+msg.chat_id;
            let $chatRoom     = $msgContainer.find("."+chatRoomClass);

            let userClass = "user-brief-"+msg.chat_type+"-"+msg.chat_id;
            let $user     = $userContainer.find("."+userClass);

            if ($user.length <= 0) {
                let userData = {};
                userData.chat_id   = msg.chat_id;
                userData.chat_type = msg.chat_type;
                userData.chat_name = msg.sender_name;

                let html = _.templateOfUser(userData);
                $userContainer.append(html);
            }

            $user = $userContainer.find("."+userClass);
            
            if ($chatRoom.length <= 0) {
                let chatId    = $user.attr('data-chat-id');
                let chatType  = $user.attr('data-chat-type');
                let chatName  = $user.find(".title-name").text();

                let chatRoomData = {};
                chatRoomData.chatId    = chatId;
                chatRoomData.chatType  = chatType;
                chatRoomData.chatName  = chatName;

                let chatRoomHtml = _.templateOfChatRoom(chatRoomData);
                $msgContainer.append(chatRoomHtml);
            }

            $msgContainer.find("."+chatRoomClass).find(".content-msg-word").append(html);
        };
        // 模板 - 用户
        this.templateOfUser = function(data) {
            let userClass = "user-brief-"+data.chat_type+"-"+data.chat_id;

            return '<li class="user-brief '+userClass+'" data-chat-id="'+data.chat_id+'" data-chat-type="'+data.chat_type+'">'+
                '<div class="user-avatar">'+
                    '<img src="../../public/img/avatar-1.jpeg" alt="avatar" srcset=""/>'+
                '</div>'+
                '<div class="user-info">'+
                    '<div class="info-title">'+
                        '<span class="title-name">'+data.chat_name+'</span>'+
                        '<span class="title-time"></span>'+
                    '</div>'+
                    '<div class="info-msg">'+
                        '<p></p>'+
                    '</div>'+
                '</div>'+
            '</li>';
        };
        // 模板 - 私聊消息
        this.templateOfPrivateMsg = function(msg) {
            let time       = '';
            let senderId   = 0;
            let senderName = '';
            let content    = '';

            if (msg.hasOwnProperty("time")) time = msg.time;
            if (msg.hasOwnProperty("sender_id")) senderId = msg.sender_id;
            if (msg.hasOwnProperty("sender_name")) senderName = msg.sender_name;
            if (msg.hasOwnProperty("content")) content = msg.content;

            let liClass = '';
            if (senderId == _.options.userId) liClass = "right";

            let html = '<li class="msg-detail '+liClass+'">'+
                '<div class="msg-detail-avatar">'+
                    '<img src="../../public/img/avatar-1.jpeg" alt="avatar" srcset=""/>'+
                '</div>'+
                '<div class="msg-detail-info">'+
                    '<p class="info-title">'+
                        '<span class="username">'+senderName+'</span>'+
                        '<span class="time">'+time+'</span>'+
                    '</p>'+
                    '<div class="info-content">'+
                        '<span class="word">'+content+'</span>'+
                    '</div>'+
                '</div>'+
            '</li>';
            
            return html;
        };
        // 模版 - 聊天室
        this.templateOfChatRoom = function(data) {
            let chatClass = 'chatroom-'+data.chatType+'-'+data.chatId;

            return '<div class="layui-col-xs12 msg-chatroom '+chatClass+'" data-chat-id="'+data.chatId+'" data-chat-type="'+data.chatType+'">'+
                '<div class="layui-row msg-chatroom-content">'+
                    '<div class="layui-col-xs12 content-title">'+
                        '<h1 class="title-name">'+data.chatName+'</h1>'+
                    '</div>'+
                    '<div class="layui-col-xs12 content-msg">'+
                        '<ul class="content-msg-word"></li>'+
                        '</ul>'+
                    '</div>'+
                    '<div class="layui-col-xs12 content-edit">'+
                        '<div class="content-edit-toolbar"></div>'+
                        '<div class="content-edit-word kl-content-edit" contenteditable="true"></div>'+
                        '<div class="content-edit-submit">'+
                            '<button class="layui-btn layui-btn-normal layui-btn-sm kl-send-btn">发送</button>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
            '</div>';
        }

        this.getAjax = function(type, url, params) {
            return new Promise(function(resolve, reject) {
                $.ajax({
                    url : url,
                    type: type,
                    data: params,
                    dataType: 'json',
                    timeout : 10000,
                    success : function(data) {
                        resolve(data);
                    },
                    error  : function(error) {
                        layer.alert("登录超时，请重新登录", function(index) {
                            window.open('/');
                            layer.close(index);
                        });
                        reject("relogin");
                    }
                });
            });
        };

        // 时间格式化
        this.formatDate = function(date, type='datetime') {
            var date = new Date(parseInt(date) * 1000);
            var YY = date.getFullYear();
            var MM = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
            var DD = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate());
            var hh = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours());
            var mm = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
            var ss = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());

            var result = YY+'-'+MM+'-'+DD+' '+hh+':'+mm+':'+ss;
            switch (type) {
                case 'datetime':
                    break;
                case 'time':
                    result = hh+':'+mm+':'+ss;
                    break;
            }

            return result;
        };
    };

    MyChattool.prototype = {
        init: function () {
            var _ = this;

            _.getWebsocketClient().then(function(info) {
                $("#msg-container").click(function(e) {
                    let $target = $(e.target);

                    if ($target.hasClass("kl-send-btn")) {
                        _.sendChatMsg($target);
                    }
                });
                $("#msg-container").keydown(function(e) {
                    let keyCode = e.keyCode;
                    let $target = $(e.target);

                    let $parentEle = $target.parents(".msg-chatroom");
                    if ($parentEle.length >= 1) {
                        switch (keyCode) {
                            case 13:
                                _.sendChatMsg($parentEle.find(".kl-send-btn"));
                                break;
                        }
                    }
                });

                $("#user-container").click(function(e) {
                    let $target = $(e.target);

                    let $userLi = $target.parents(".user-brief");

                    if ($userLi.length > 0) {
                        $userLi.addClass("user-brief-bgcolor").siblings().removeClass("user-brief-bgcolor");
                        
                        let chatId    = $userLi.attr('data-chat-id');
                        let chatType  = $userLi.attr('data-chat-type');
                        let chatName  = $userLi.find(".title-name").text();
                        let chatClass = 'chatroom-'+chatType+'-'+chatId;

                        let $refChatRoom = $("#msg-container").find("."+chatClass);

                        if ($refChatRoom.length <= 0) {
                            let chatRoomData = {};
                            chatRoomData.chatId    = chatId;
                            chatRoomData.chatType  = chatType;
                            chatRoomData.chatName  = chatName;

                            let chatRoomHtml = _.templateOfChatRoom(chatRoomData);
                            $("#msg-container").append(chatRoomHtml);
                        }

                        $("#msg-container").find("."+chatClass).show().siblings().hide();
                    }
                });
            }).catch(function(err) {
                console.log(err);

                layui.use('layer', function(){
                    layer = layui.layer;
                    layer.alert(err);
                });
            });
        },
    };

    $.fn.MyChattool = function(options) {
        myChattool = new MyChattool(this, options);
        return myChattool.init();
    };
})(jQuery, window, document, layui);