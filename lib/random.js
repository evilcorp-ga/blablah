// All external imports
const crypto = require('crypto');

var random = function (length) {
    this.length = length;
}

random.prototype.generate = function () {
    var this_ = this; // Preserve scope in promise
    return new Promise((fullfill,reject) => {
        crypto
            .randomBytes(this.length,(err,buffer) => {
                if(err) {
                    reject(err);
                } else {
                    var token = buffer.toString('hex');
                    fullfill(token);
                }
            });
    });
}

module.exports = random;
