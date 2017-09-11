// Global modules

var cache = [];

var chatCache = function() {

};


chatCache.prototype.append = function (ctx) {
    cache.push(ctx);
};

chatCache.prototype.get = function () {
    return cache;
};


module.exports = chatCache;


