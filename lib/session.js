// Import all libraries
const net    = require('net');
const random = require('../lib/random');
const irc    = require('../lib/irc');

function escape(s) {
    return s.replace(/[&"<>]/g, function (c) {
        return {
            '&': "&amp;",
            '"': "&quot;",
            '<': "&lt;",
            '>': "&gt;"
        }[c];
    });
}

/**
 * Sone usernames are sent with roles like !,+,@
 * this function is supposed to clear them out
 */
function clear_username(username) {
    var f = username.charAt(0);
    if(f === "!" || f === "+" || f === "@") {
        return username.substr(1,username.length);
    } else {
        return username;
    }
}

/**
 * Replaces links with a(href) tag
 */
function linkify(inputText) {
    var replacedText, replacePattern1, replacePattern2, replacePattern3;

    //URLs starting with http://, https://, or ftp://
    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

    //Change email addresses to mailto:: links.
    replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
    replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

    return replacedText;
}


// List containing all connections
var connections = {};

/**
 * Session class to handle connections
 * to irc
 * @contructor
 * @param {String} host - hostname of remote
 * @param {Number} port - port for remote
 */
var session = function (host, port) {
    this.host   = host;
    this.port   = port;
    this.client = null;
    this.key    = null;
}

// Send a new message
session.prototype.send_message = function (sessid,message,channel) {
    this.sessid = sessid;
    this.message = message;
    this.channel = channel;
    var this_ = this;
    return new Promise((fullfill,reject) => {
        try {
            this_.channel = clear_username(channel);
            var msg_h = escape(this_.message);
            msg_h = linkify(msg_h);
            connections[this_.sessid]
                .client
                .write("PRIVMSG "+this_.channel+" "+this_.message+"\n");

            var ctx = {};
            ctx.type = "mine";
            ctx.pm = false;
            if(this_.channel !== "#lobby") {
                ctx.pm = true;
                ctx.to = this_.channel;
            }
            ctx.from = connections[this_.sessid].username;
            ctx.message = msg_h;
            connections[this_.sessid]
                .logs
                .unshift(ctx);

            fullfill();
        } catch (err) {
            reject(err);
        }
    });
};

/**
 * Sends quit to IRC server and closes the socket
 */
session.prototype.logout = function (sessid) {
    var this_ = this;
    return new Promise((fullfill,reject) => {
        try {
            var connection_ctx = connections[sessid];
            connection_ctx.client.write("QUIT : Toodles\n");
            connection_ctx.client.end();
            delete connections[sessid];
            fullfill();
        } catch (err) {
            reject(err);
        }
    });
};

//Get the list of users of the channel and add it to users in our connection
session.prototype.get_users = function (sessid, channel) {
    var this_ = this; // because georoot said so
    // Dear dusty,
    //     georoot still doesn't see the point. this function
    // is not using this_ in anyway. For future look at this
    // YT video https://www.youtube.com/watch?v=6ACl8s_tBzE .
    // "Don't blame it on georoot, blame it on nodejs"
    //
    // Cheers
    // Georoot
    return new Promise((fullfill,reject) => {
        try {
            var connection_ctx = connections[sessid];
            connection_ctx.client.write("NAMES "+channel+"\n");
            fullfill();
        } catch (err) {
            reject(err); //with a broken heart
        }
    });
};

// Get existing session
session.prototype.get_logs = function (sessid) {
    var this_ = this;
    return new Promise((fullfill,reject) => {
        try {
            fullfill(connections[sessid]);
        } catch (err) {
            reject(err);
        }
    });
};

// Create a new user session
session.prototype.create_new = function () {
    var this_ = this; // Preserve scope in promise
    return new Promise((fullfill,reject) => {
        this.client = net.createConnection({
            "host" : this_.host,
            "port" : this_.port
            }, (err) => {
                if(err) {
                    reject(err);
                } else {
                    fullfill();
                }
            });
    });
};

session.prototype.commit_connection = function () {
    var this_ = this; // Preserve scope in promise
    return new Promise((fullfill,reject) => {
        // 64 bytes should be enough entropy
        var random_ctx = new random(64);
        random_ctx
            .generate()
            .then((random_string) => {
                var connection_ctx = {};
                connection_ctx.client = this_.client;
                connection_ctx.logs = [];
                connections[random_string] = connection_ctx;
                this_.key = random_string;
                fullfill();
            })
            .catch(reject);
    });
};

session.prototype.attach_handle = function () {
    var this_ = this; // Preserve scope in promise
    return new Promise((fullfill,reject) => {
        this_.client.on('data', (data) => {
            var irc_ctx = new irc(data.toString(),connections[this_.key]);
            irc_ctx
                .tableTennis()
                .then(()=> irc_ctx.exe_command())
                .then((line) => {
                    connections[this_.key].logs.unshift(line);
                    connections[this_.key].logs = connections[this_.key].logs.slice(0,50);
                })
                .catch((err) => {
                    //console.log(data.toString());
                    // Line should not be displayed
                });
        });
        this_.client.on('end', () => {
        });
        fullfill();
    });
};

session.prototype.set_user = function (username) {
    this.username = username;
    var this_ = this;
    return new Promise((fullfill,reject) => {
        try {
            this_.client.write("USER "+this_.username+" 1 1 "+this_.username+"\n");
            this_.client.write("NICK "+this_.username+"\n");
            connections[this_.key].username = this_.username;
            connections[this_.key].users = [];
            fullfill(this_.key);
        } catch(err) {
            reject(err);
        }
    });
};

session.prototype.get_initial_users = function () {
    var this_ = this;
    return new Promise((fullfill,reject) => {
        this_.client.write("USERS #lobby\n");
        fullfill(this_.key);
    });
};

module.exports = session;
