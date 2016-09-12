# thingweb-webui
A W3C WoT "current practices" compliant web client.

Static HTML5 and javascript, dependencies managed with bower.

## Basic running
Just install all frontend-deps with bower (you need node.js and ``npm -g install bower``)
```bash
bower install
```
Then you can serve the files from any HTTP (or HTTP/2) server. 
 
Dev Example
```bash
# use any webserver - serve is just an example
npm install -g serve
serve
```
## Advanced running - only for [Thingweb Repository](https://github.com/thingweb/thingweb-repository)
Install frontend-deps with bower (see above).
Install node modules from package.json:
```bash
npm install
```
  - express: simple web application framework (no need to install other webserver). See [documentation](https://expressjs.com/)
  - node-coap: client and server library for CoAP, from [mcollina](https://github.com/mcollina/node-coap). It supports "observe" relation, which is needed to use the web client with the [Thingweb Repository](https://github.com/thingweb/thingweb-repository).
  - url-parse: small footprint URL parser. See [documentation](https://www.npmjs.com/package/url-parse).

Run the server:
```bash
node main.js
```

## CoAP Polyfill

For CoAP support, please run the [CoAP polyfill](https://github.com/ynh/coap-polyfill) from YNH (runnable jar in this repo)

```bash
java -jar coap-polyfill-1.0.0-M3.jar
```

## Minified build / optimizations
This project is meant as an explorative prototype / reference implementation - not for productive use.

if you are certain you need an optimized build, install dev-dependencies with NPM 
and use gulp (you need node.js and ``npm -g install gulp-cli``) to run optimizers.

The shrinked page is availiable in /dist.

```bash
npm install 
gulp
```

## License 
MIT

## Authors
Johannes Hund (@horus), Daniel Peintner (@danielpeintner) and the Thingweb community