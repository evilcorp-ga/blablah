// Import all libraries
const net    = require('net');
const random = require('../lib/random');
const irc    = require('../lib/irc');

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
            var irc_ctx = new irc(data.toString());
            irc_ctx
                .parse()
                .then((line) => {
                    connections[this_.key].logs.push(line);
                })
                .catch((err) => {
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
            fullfill(this_.key);
        } catch(err) {
            reject(err);
        }
    });
};

module.exports = session;