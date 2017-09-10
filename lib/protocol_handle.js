const color = require('./color.js');

var handle = {};

handle["PRIVMSG"] = function (line) {
    var line = line.split(":");
    var user = line[1].split("!");
    var message = user[0]+" : "+line[2];
    var ctx = {};
    ctx.type = "message";
    ctx.from = user[0];
    ctx.message = line[2];

    var color_ctx = new color(ctx.from);
    ctx.color = color_ctx.get_color();

    return ctx;
};

handle["KICK"] = function (line) {
    var ctx = {};
    ctx.type = "kick";
    var line_split = line.split(":");
    ctx.kicked_by = line_split[1].split("!")[0];
    var line_whitespace_split = line.split(" ");
    ctx.kicked_user = line_whitespace_split[3];
    ctx.kick_from = line_whitespace_split[2];
    ctx.kick_message = line_split[2];
    
    return ctx;
};


module.exports = handle;
