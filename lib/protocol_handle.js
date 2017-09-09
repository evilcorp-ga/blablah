var handle = {};

handle["PRIVMSG"] = function (line) {
    var line = line.split(":");
    var user = line[1].split("!");
    var message = user[0]+" : "+line[2];
    return message;
};

handle["kick"] = function (line) {
    return "Someone was kicked :/";
};


module.exports = handle;
