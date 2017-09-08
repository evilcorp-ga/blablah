// Import all libraries
const net    = require('net');
const random = require('../lib/random');

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
        // 32 bytes should be enough entropy
        var random_ctx = new random(32);
        random_ctx
            .generate()
            .then((random_string) => {
                connections[random_string] = this_.client;
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
            data = data.toString();
            console.log(this_.key+" : "+data);
        });
        fullfill();
    });
};

module.exports = session;
