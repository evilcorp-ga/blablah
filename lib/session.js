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
session.prototype.send_message = function (sessid,message) {
    this.sessid = sessid;
    this.message = message;
    var this_ = this;
    return new Promise((fullfill,reject) => {
        try {
            var msg_h = escape(this_.message);
            msg_h = linkify(msg_h);
            connections[this_.sessid]
                .client
                .write("PRIVMSG #Lobby "+this_.message+"\n");

            var ctx = {};
            ctx.type = "mine";
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

// Get existing session
session.prototype.get_logs = function (sessid) {
    var this_ = this;
    return new Promise((fullfill,reject) => {
        try {
            fullfill(connections[sessid].logs);
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
            // TODO set previous messages
            fullfill(this_.key);
        } catch(err) {
            reject(err);
        }
    });
};

module.exports = session;
