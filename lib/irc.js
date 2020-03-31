// Global imports
const handle = require('./protocol_handle');
const notice = require('./notice');
var channel = process.env.channel;

/**
 * Parse irc commands from serer
 * @constructor
 * @param {String} line - raw string from server
 */
var irc = function (line,connection) {
    this.line = line;
    this.cmd = line.split(" ");
    this.connection = connection;
    if( connection ){
        if(this.line.indexOf("End of message of the day") > -1) this.connection.client.write("JOIN "+channel+" "+connection.chankey+"\n");
    }
};

irc.prototype.tableTennis = function() {
    var this_ = this;
    return new Promise((fullfill,reject) => {
        if(this_.cmd[0] === "PING") {
            this_.connection.client.write("PONG\n");
            reject(new Error("PING PONG"));
        }else {
            fullfill();
        }
    });
};

irc.prototype.exe_command = function () {
    var this_ = this;
    return new Promise((fullfill,reject) => {
        try {
            var resp = handle[this_.cmd[1]](this_.line,this_.connection);
            fullfill(resp);
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = irc;
