const random = require('randomcolor');

var color_list = {};

/**
 * Interface class to get and create colors
 */
var color = function (username) {
    this.username = username;
}

/**
 * Get user color
 */
color.prototype.get_color = function () {
    if (color_list[this.username] !== undefined) {
        return color_list[this.username];
    } else {
        color_list[this.username] = random();
        return color_list[this.username];
    }
}

module.exports = color;
