/*
global
    emit,
    attributes,
    parser,
    login,
    register,
    flairify,
    navigator,
    connect
*/

var uiAttributes = {
    recentMessages : {
        "main" : [],
    },
    activeRoom: 'main',
};

function clearMessages() {
    messageContainer.innerHTML = "";
}

function addListenerToAll(nodeList, type, func) {
    for (var x = 0; x < nodeList.length; x++) {
        nodeList[x].addEventListener(type, func);
    }
}

/*
    PROMPT
*/

var authenticateForm = document.getElementById("authenticateForm");
var signupForm = document.getElementById("signupForm");

var prompt = document.getElementById("prompt");
var closeButton = document.getElementById("closePrompt");

closeButton.onclick = function() {
    prompt.className = "close";
};

var goToSignup          = document.getElementById("goToSignup");
var goToAuthenticate    = document.getElementById("goToAuthenticate");

goToSignup.onclick = function() {
    prompt.className = "signup";
};

goToAuthenticate.onclick = function() {
    prompt.className = "authenticate";
};

var authenticateButton = document.getElementById("authenticate");
authenticateButton.onclick = function() {

    prompt.className = "close";
    login(
        authenticateForm.children[0].value,
        authenticateForm.children[1].value
    );

};

var signupButton = document.getElementById("signup");
signupButton.onclick = function() {

    var password = signupForm.children[1].value;

    if (password != signupForm.children[2].value) return false;

    prompt.className = "close";
    register(
        signupForm.children[0].value,
        password
    );

};

/*
    SIDE MENU
*/

var menuButton  = document.getElementById("menuButton");
var sideMenu    = document.getElementById("sideMenu");

var loginButton = document.getElementById("login");

var addRoomButton = document.getElementById("addRoom");
var addUserButton = document.getElementById("addUser");

menuButton.onclick = function() {
    sideMenu  .classList.toggle("close");
    menuButton.classList.toggle("close");
};

function changeRooms(room) {
    clearMessages();
    uiAttributes.activeRoom = room;
    if (attributes.rooms.indexOf(room) < 0) { // New room.
        emit(['join', room]);
        emit(['giveRecent', room]);
        attributes.rooms.push(room);
        uiAttributes.recentMessages[room] = [];
    }
    else { // Old room.
        var messages = uiAttributes.recentMessages[room];
        for (var x = 0; x < messages.length; x++) {
            var message = messages[x];
            displayMessage(
                message.nick,
                message.post,
                message.id,
                message.flair,
                room
            );
        }
    }
}

addListenerToAll( document.getElementsByClassName("room"),
"click", function(event) {
    changeRooms(event.target.getAttribute("name"));
});

loginButton.onclick = function(event) {
    prompt.className = "authenticate";
};

addRoomButton.onclick = function(event) {
    prompt.className = "addroom";
};

addUserButton.onclick = function(event) {
    prompt.className = "adduser";
};

/*
    CHAT BOX
*/

var messageContainer = document.getElementById("receivedMessages");

var previousMessage = {
    nick: "",
    post: "",
    id: 0,
    flair: "",
};

document.getElementById("submitButton").onclick = function(event) {
    var messageBox = document.getElementById("messageText");
    var message = messageBox.value;

    if (message.length == 0) return false;

    if ( message[0] == ".") {
        return console.log(message); // To-do : Handle commands and shit.
    }

    emit(['roomMessage', message, uiAttributes.activeRoom]);
    messageBox.value = "";
};

function autoScroll() {
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function displayMessage(nick, post, id, flair, room) {
    if (room != uiAttributes.activeRoom) {
        uiAttributes.recentMessages[room].push({
            nick: nick,
            post: post,
            id: id,
            flair: flair,
        });
        return false;
    }
    var messageDiv  = document.createElement("div");
    messageDiv.className = "message";

    var idDiv       = document.createElement("div");
    var usernameDiv = document.createElement("div");
    var postDiv     = document.createElement("div");

    idDiv.innerHTML = id;
    usernameDiv.innerHTML = flairify(nick, flair);   // Implement flairify
    postDiv.innerHTML = 
        parser.style(
        parser.quote(
        parser.htmlEscape(
            post
        )));

    idDiv.className = "id";
    messageDiv.appendChild(idDiv);

    usernameDiv.className = "username";
    messageDiv.appendChild(usernameDiv);

    postDiv.className = "postContent";
    messageDiv.appendChild(postDiv);

    messageContainer.appendChild(messageDiv);

    autoScroll();
}

function displayTopic(topic) {
    var topicDiv = document.createElement("div");
    topicDiv.className = "topic";
    topicDiv.innerHTML = parser.htmlEscape(topic);

    messageContainer.appendChild(topicDiv);

    autoScroll();
}

/*
    CORDOVA SPECIFICS
*/

var fileSystem;

// Wait until device is ready to start.
document.addEventListener('deviceready', function(event) {

    window.requestFileSystem(window.PERSISTENT, 1024*2048, function(system) {

        fileSystem = system;

    }, function() { alert("COULDN'T USE FILESYSTEM! WARNING!"); });

    connect();
}, false);

// Links the phone's physical menu button to the app's.
document.addEventListener('menubutton', function(event) {
    menuButton.click();
}, false);