/**
 * Main file that starts a server to run the app
 * and configures the basic routing.
 */
var express = require('express');
var path    = require('path');

// For ThingWeb Repository
var coap    = require('coap');
var events  = require('events');
var util = require('util');


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


// ### Routing for Thingweb Repository ###
//For observe events
function ObserveRequest() { }
util.inherits(ObserveRequest, events.EventEmitter);

// Used to GET TDs from repository
app.get('/loadTD',function(rq, res) {
	
	// set timeout as high as possible
    rq.socket.setTimeout(60000);
    
    // send headers for event-stream connection
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    res.write("\n");
    
    // set CoAP Request
	var coapReq = {
		hostname: 'localhost',
		host: 'localhost',
		port: 5683,
		pathname: '/td',
		observe: true,
		multicast: true,
		multicastTimeout: 40000
	};
	var result = '';
	
	function startObserver(res2) {
		
		console.log("Received notification...\n");
		
		// send response through event
		var result = JSON.parse(res2.payload);
		for (var name in result) {
			console.log("found " + name);
			//res.write("event: observing\n");
			//res.write("data: " + JSON.stringify(result[name]) + "\n\n");
		}
		
		res.write("event: observing\n");
		res.write("data: " + JSON.stringify(result) + "\n\n");
		
	}
	
	var request = new ObserveRequest();
	request.on('subscribe', function(coapReq) {
		
		// send CoAP request
		req = coap.request(coapReq);
		
		req.on('response', startObserver);
		
		req.on('close', function(err) {
			console.log("Closing observer ...\n");
			req.removeListener('observing', startObserver);
		});
		
		req.on('error', function() {
			console.log(err);
		});
		
		req.end();
		
	});
	request.emit('subscribe', coapReq);
	
});

// #######################################

// Start the server
app.listen(port, host);
console.log('Server is listening on port 8081!');