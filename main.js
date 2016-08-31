/**
 * Main file that starts a server to run the app
 * and configures the basic routing.
 */
var express = require('express');
var path    = require('path');

// The server configuration
var app  = express();
var port = 8081; // can't be 8080 when used with thingweb-repository
var host = '127.0.0.1';

// Keep public folders and serve static files to Express
app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/js'));
app.use(express.static(__dirname + '/jsonld-samples'));
app.use(express.static(__dirname + '/bower_components'));

app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/js', express.static(__dirname + '/js'));

app.listen(port, host);
console.log('Server is listening on port 8081!');