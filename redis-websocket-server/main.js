const process = require( "process" );
const path = require( "path" );
const ip = require( "ip" );
const http = require( "http" );
const WebSocket = require( "ws" );
//const RedisUtils = require( "redis-manager-utils" );
const EventEmitter = require( "events" );

const PythonScriptSubscriber = require( "./python_script_subscriber.js" );

process.on( "unhandledRejection" , function( reason , p ) {
	console.error( reason, "Unhandled Rejection at Promise" , p );
	console.trace();
});
process.on( "uncaughtException" , function( err ) {
	console.error( err , "Uncaught Exception thrown" );
	console.trace();
});

// TODO:
// https://github.com/dkrutsko/express-bouncer
// https://github.com/AdamPflug/express-brute
// https://github.com/helmetjs/helmet
// Encyrpt HTTP Auth Username and Password with Libsodium

( async ()=> {

	const PersonalFilePath = path.join( process.env.HOME , ".config" , "personal" , "raspi_motion_alarm_rewrite.json" );
	const Personal = require( PersonalFilePath );
	module.exports.personal = Personal;

	const PORT = Personal.websocket_server.port || 6262;
	module.exports.port = PORT;
	const LOCAL_IP = ip.address();

	const event_emitter = new EventEmitter();
	module.exports.event_emitter = event_emitter;

	// const python_script_subscriber = await PythonScriptSubscriber.init();
	// python_script_subscriber.redis.subscribe( "python-script-controller" );

	const express_app = require( "./express_app.js" );
	const server = http.createServer( express_app );
	const WebSocketManager = require( "./websocket_manager.js" );
	const websocket_server = new WebSocket.Server( { server } );
	console.log( websocket_server );
	server.listen( PORT , ()=> {
		console.log( "Sleep REDIS WebSocket Server Starting" );
		console.log( `\thttp://:localhost:${ PORT.toString() }` );
		console.log( `\thttp://:${ LOCAL_IP }:${ PORT.toString() }` );
	});
	websocket_server.on( "connection" ,  WebSocketManager.on_connection );

})();