// Global imports
const handle = require('./protocol_handle');

/**
 * Parse irc commands from serer
 * @constructor
 * @param {String} line - raw string from server
 */
var irc = function (line) {
    this.line = line;
    this.cmd = line.split(" ");
};

irc.prototype.tableTennis = function() {
    var this_ = this;
    return new Promise((fullfill,reject) => {
        if(this_.cms[0] === ":PING") {
            console.log(this_.line);
            reject(new Error("PING PONG"));
        }else {
            fullfill();
        }
    });
};

irc.prototype.parse = function () {
    var this_ = this;
    return new Promise((fullfill,reject) => {
        try {
            var resp = handle[this_.cmd[1]](this.line);
            fullfill(resp);
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = irc;
