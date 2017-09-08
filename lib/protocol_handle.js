var handle = {};

handle["PRIVMSG"] = function (line) {
    return "Someone sent a message";
};

handle["kick"] = function (line) {
    return "Someone was kicked :/";
};


module.exports = handle;
