/**
 * Main file that starts a server to run the app
 * and configures the basic routing.
 */
var express = require('express');
var path    = require('path');

// For ThingWeb Repository
'use strict';
var URL    = require('url-parse');
var coap   = require('coap');
var events = require('events');
var util   = require('util');

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
var twrUrl;

//For observe events
function ObserveRequest() { }
util.inherits(ObserveRequest, events.EventEmitter);

function parseURL(rawURL) {
	
	var url = new URL(rawURL, true);
	
	if (!url.port) {
		// default coap port
		url.set('port', 5683);
	}
	
	if (!url.pathname || url.pathname == '/') {
		// default pathname
		url.set('pathname', '/td');
	}
	
	return url
}

// GET TDs from repository by an observe request
app.get('/loadTD/:twrUri',function(rq, res) {
	
	twrUrl = parseURL(rq.params.twrUri); 
	console.log(twrUrl.pathname);
	
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
    	hostname: twrUrl.hostname,
    	host: twrUrl.host,
    	port: twrUrl.port,
    	pathname: twrUrl.pathname,
    	observe: true,
    	multicast: true,
    	multicastTimeout: 40000
    };

	var result = '';
	
	function startObserver(res2) {
		
		console.log("Received notification...");
		
		// send response through event
		var result = JSON.parse(res2.payload);
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
		
		req.on('error', function(err) {
			console.log(err);
		});
		
		req.end();
		
	});
	request.emit('subscribe', coapReq);
	
});

app.get('/searchTD',function(rq, res){

	var queryType = rq.query.queryType;
	var param = '';
	
	// Check type of query
	if (queryType == "sparql") {
		param += '?query=' + rq.query.queryContent;
	} else {
		param += '?text=\"' + rq.query.queryContent + '\"';
	}
	
    // Send CoAP Request
	req   = coap.request(twrUrl + param);
	req.on('response', function(res2) {
		var result = res2.payload;
		var j = JSON.parse(result);
		res.json(j);
	});
	req.end();
});

// #######################################

// Start the server
app.listen(port, host);
console.log('Server is listening on port 8081!');