const bot = require('./core')

var forked = null

exports.getForked = function () {
    return forked;
};

exports.setForked = function (forked) {
    forked = forked;
};
exports.socket = function (io) {
    io.on("connection", function (client) {
        bot.createVideo(client, forked)
        console.log(`Connection client ${client.id}`)
    });
}