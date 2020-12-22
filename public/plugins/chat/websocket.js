;(function($, window, document, layui, undefined) {
    var MyChattool = function(ele, opt) {
        this.$element = ele;
        this.defaults = {
            'userId': 1,
            'websocketUrl' : 'ws://140.143.30.113:13000/chat',
            'websocketClient': null,
            'username': '',
            'max': 2000,
        };

        this.options = $.extend({}, this.defaults, opt);

        var _ = this;

        // websocket
        this.getWebsocketClient = function() {
            return new Promise(function(resolve, reject) {
                if ("WebSocket" in window) {
                    if (_.options.websocketClient) {
                        resolve("服务器连接成功");
                        return true;
                    }

                    var ws = new WebSocket(_.options.websocketUrl, _.options.userId);

                    ws.onopen = function() {
                        _.options.websocketClient = ws;
                        resolve("服务器连接成功");

                        // 发送账号信息
                        let content = {name: _.options.username};
                        _.sendMessage(content, 10000);
                    };

                    ws.onmessage = function (evt) {
                        var msg = evt.data;
                        msg = eval("("+msg+")");

                        _.handleMessage(msg);
                    };

                    ws.onclose = function(){
                        _.options.websocketClient = null;
                        layer.alert("服务器连接关闭");
                    };

                    ws.onerror=function(event){
                        _.options.websocketClient = null;
                        layer.alert("服务器连接关闭");
                        console.log("websocket连接失败", event);
                    }
                } else {
                    reject("您的浏览器不支持 WebSocket!");
                }
            });
        };
        // 发送消息
        this.sendMessage = function(content, type = 10001, kind = 1) {
            let sendMsg = {};
            sendMsg.type = type;
            sendMsg.Kind = kind;
            sendMsg.Data = content;
            
            _.options.websocketClient.send(JSON.stringify(sendMsg));
        }
        // 消息处理
        this.handleMessage = function(msg) {
            switch (msg.type) {
                // 注册成功
                case 10000:
                    // 1. 拉取用户列表
                    _.users(msg.data["users"]);
                    break;
                // 私聊
                case 10001:
                    _.users(msg)
                    break;
            }
        };
        // 用户渲染
        this.users = function(users) {
            let $container = $("#user-container");
            $container.children().remove();

            for(var i in users) {
                let html = _.templateOfUser(users[i]);
                $container.append(html);
            }
        };
        // 消息渲染
        this.messages = function() {
            // 
        };
        // 模板 - 用户
        this.templateOfUser = function(data) {
            return '<li class="user-brief" data-id="'+data.id+'">'+
                '<div class="user-avatar">'+
                    '<img src="../../public/img/avatar-1.jpeg" alt="avatar" srcset=""/>'+
                '</div>'+
                '<div class="user-info">'+
                    '<div class="info-title">'+
                        '<span class="title-name">'+data.name+'</span>'+
                        '<span class="title-time">19:30</span>'+
                    '</div>'+
                    '<div class="info-msg">'+
                        '<p>hello world 1</p>'+
                    '</div>'+
                '</div>'+
            '</li>'; 
        };
        // 模板 - 消息
        this.templateOfMsg = function(msg) {
            let channelName = '';
            if (_.options.channels.hasOwnProperty(chatMsg.channel)) {
                channelName = _.options.channels[chatMsg.channel];
            }

            let serverName = '';
            if (_.options.servers.hasOwnProperty(chatMsg.spid) && _.options.servers[chatMsg.spid].hasOwnProperty(chatMsg.sid)) {
                serverName = _.options.servers[chatMsg.spid][chatMsg.sid].name+'-';
            }

            let html = '';
            switch (chatMsg.channel) {
                case 4:
                    if (type == 'pull') {
                        html = '<li class="chat-'+chatMsg.channel+'" data-ip="'+chatMsg.ip_addr+'">'
                            +'<span class="time">['+_.formatDate(chatMsg.add_time, 'time')+']</span>'
                            +'<span class="sp" data-spid="'+chatMsg.spid+'">['+chatMsg.spid+']</span>'
                            // +'<span class="server" data-server="'+chatMsg.sid+'">['+serverName+chatMsg.sid+']</span>'
                            +'<span class="server" data-server="'+chatMsg.sid+'">['+chatMsg.sid+']</span>'
                            +'<span class="channel-'+chatMsg.channel+'">['+channelName+']</span>'
                            +'<span class="role_name">'+chatMsg.role_name+'</span>'
                            +'<span class="vip">('+chatMsg.from_vip_level+')</span>'
                            +'<span class="siliao">对</span>'
                            +'<span class="role_name">'+chatMsg.sec_chat_role_id+'</span>'
                            +'<span class="vip">('+chatMsg.receiver_vip_level+')</span>'
                            +'<span class="siliao">说：</span>'
                            +'<span class="chat_content">'+chatMsg.chat_content+'</span></li>';
                    } else {
                        html = '<li class="chat-'+chatMsg.channel+'" data-ip="'+chatMsg.ip_addr+'">'
                            +'<span class="time">['+_.formatDate(chatMsg.add_time, 'time')+']</span>'
                            +'<span class="sp" data-spid="'+chatMsg.spid+'">['+chatMsg.spid+']</span>'
                            // +'<span class="server" data-server="'+chatMsg.sid+'">['+serverName+chatMsg.sid+']</span>'
                            +'<span class="server" data-server="'+chatMsg.sid+'">['+chatMsg.sid+']</span>'
                            +'<span class="channel-'+chatMsg.channel+'">['+channelName+']</span>'
                            +'<span class="role_name">'+chatMsg.role_name+'</span>'
                            +'<span class="siliao">对</span>'
                            +'<span class="role_name">'+chatMsg.sec_chat_role_id+'</span>'
                            +'<span class="siliao">说：</span>'
                            +'<span class="chat_content">'+chatMsg.chat_content+'</span></li>';
                    }
                    break;
                default:
                    html = '<li class="chat-'+chatMsg.channel+'" data-ip="'+chatMsg.ip_addr+'">'
                        +'<span class="time">['+_.formatDate(chatMsg.add_time, 'time')+']</span>'
                        +'<span class="sp" data-spid="'+chatMsg.spid+'">['+chatMsg.spid+']</span>'
                        // +'<span class="server" data-server="'+chatMsg.sid+'">['+serverName+chatMsg.sid+']</span>'
                        +'<span class="server" data-server="'+chatMsg.sid+'">['+chatMsg.sid+']</span>'
                        +'<span class="channel-'+chatMsg.channel+'">['+channelName+']</span>'
                        +'<span class="role_name">'+chatMsg.role_name+'</span>'
                        +'<span class="chat_content">：'+chatMsg.chat_content+'</span></li>';
                    break;
            }

            return html;
        };

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
                layer.alert(info);

            }).catch(function(err) {
                console.log(err);
                layer.alert(err);
            });
        },
    };

    $.fn.MyChattool = function(options) {
        myChattool = new MyChattool(this, options);
        return myChattool.init();
    };
})(jQuery, window, document, layui);