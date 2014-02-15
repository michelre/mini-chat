var templatesLogin = {
    "disconnected": '<input type="text" placeholder="pseudo"/><button class="active">Se connecter</button>',
    "connected": '<button class="inactive">Se déconnecter</button>'
}

$('.write-msg button').on("click", function (event) {
    socket.emit("message", {"content": $(".write-msg textarea").val()});
});

socket.on("connect", function (data) {
    var users = (data) ? data.users : [];
    for (var i = 0; i < users.length; i++) {
        $('.participants').append("<li>" + users[i] + "</li>")
    }
});

socket.on("newUser", function (data) {
    $('.participants').append("<li>" + data.username + "</li>");
    createNews(data.username + " a rejoint la conversation")
});

socket.on("formData", function (data) {
    unbindEvents();
    $(".login").children().remove();
    $(".login").append(templatesLogin[data.state]);
    bindEvents();
    if (data.state === "disconnected") {
        $(".write-msg textarea").attr("readonly", "");
        $(".write-msg button").attr("disabled", "");
    } else {
        $(".write-msg textarea").removeAttr("readonly");
        $(".write-msg button").removeAttr("disabled")
    }
});

socket.on("userDisconnect", function (data) {
    $(".participants").find("li:contains('" + data.username + "')").remove();
    if (data.username)
        createNews(data.username + " a quitté la conversation")
});

socket.on("newMsg", function (data) {
    $(".chatroom .msg").val($(".chatroom .msg").val() + "\n\n" + data.username + ": " + data.message);
    $(".write-msg textarea").val("");
});

function createNews(msg) {
    $(".newsList").append("<li>" + msg + "</li>");
}

function bindEvents() {
    if ($('.login button.active').length > 0) {
        $('.login').on("click", "button.active", function () {
            var username = document.querySelector(".login input").value;
            socket.emit("connectionUser", {"username": username});
        })
    } else {
        $('.login').on("click", "button.inactive", function () {
            socket.emit("logoff");
        });
    }
}

function unbindEvents(){
    if ($('.login button.active').length > 0)
        $('.login').off("click", "button.active")
    else
        $('.login').off("click", "button.inactive");
}