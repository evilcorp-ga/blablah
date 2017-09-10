var handle = {};

handle["PRIVMSG"] = function (line) {
    var line = line.split(":");
    var user = line[1].split("!");
    var message = user[0]+" : "+line[2];
    var ctx = {};
    ctx.type = "message";
    ctx.from = user[0];
    ctx.message = line[2];
    return ctx;
};

handle["KICK"] = function (line) {
    console.log(line);
    return "Someone was kicked :/";
};


module.exports = handle;
