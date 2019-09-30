const path = require('path')
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
const socket = require('./socket')
var io = require('socket.io')(http);
var cors = require('cors')
var bodyParser = require('body-parser')


app.use(bodyParser.json());
app.use(cors())
app.use(express.static(path.join(__dirname, './app/dist')));
socket.socket(io)
app.get('/', function (req, res) {
    res.sendFile(path.resolve(__dirname, './app/dist/index.html'));
});

var port = process.env.PORT || 4000;

http.listen(port, function () {
    //lauchChrome();
    console.log(`Server started on http://localhost:${port}`)
});
function lauchChrome() {
    const ChromeLauncher = require('chrome-launcher');
    ChromeLauncher.launch({
        startingUrl: `http://localhost:${port}`
    }).then(chrome => {
        console.log(`Chrome debugging port running on ${chrome.port}`);
    });
}

