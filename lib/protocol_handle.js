const color = require('./color.js');

var handle = {};

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

function trim_cr (s) {
    return s.substring(0,s.length - 1);
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

handle["PRIVMSG"] = function (line,connection) {

    // FIXME : Add handle for to messages also
    // FIXME : Specify if message to channel or user

    var line = line.split(":");
    var user = line[1].split("!");
    var ctx = {};
    ctx.type = "message";
    ctx.from = user[0];
    ctx.message = escape(line.splice(2,line.length).join(":"));

    ctx.message = linkify(ctx.message);

    var test = ctx.message.split(" ");
    if(test[0] === "\u0001ACTION") {
        ctx.type = "action";
        ctx.message = test.splice(1,test.length).join(" ");
    }

    ctx.message = trim_cr(ctx.message);

    var color_ctx = new color(ctx.from);
    ctx.color = color_ctx.get_color();

    return ctx;
};

handle["KICK"] = function (line,connection) {
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

handle["QUIT"] = function (line,connection) {
    var ctx = {};
    ctx.type = "quit";
    var line_split = line.split(":");

    ctx.user = line_split[1].split("!")[0];

    var index = connection.users.indexOf(ctx.user);
    if (index > -1) {
        connection.users.splice(index, 1);
    }

    return ctx;
}

handle["JOIN"] = function (line,connection) {
    var ctx = {};
    ctx.type = "join";
    var line_split = line.split(":");

    ctx.user = line_split[1].split("!")[0];

    connection.users.push(ctx.user);

    return ctx;
}

module.exports = handle;
