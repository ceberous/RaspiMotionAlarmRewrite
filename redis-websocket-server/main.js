const process = require( "process" );
const path = require( "path" );
const ip = require( "ip" );
const http = require( "http" );
const WebSocket = require( "ws" );
const RedisUtils = require( "redis-manager-utils" );

process.on( "unhandledRejection" , function( reason , p ) {
	console.error( reason, "Unhandled Rejection at Promise" , p );
	console.trace();
});
process.on( "uncaughtException" , function( err ) {
	console.error( err , "Uncaught Exception thrown" );
	console.trace();
});

( async ()=> {

	const PORT = 6262;
	const LOCAL_IP = ip.address();

	const RedisUtils = require( "redis-manager-utils" );

	console.log( "Starting" );
	const redis_manager = new RedisUtils( 1 , "localhost" , 10079  );
	await redis_manager.init();
	module.exports.redis_manager = redis_manager;

	const express_app = require( "./express_app.js" );
	const server = http.createServer( express_app );
	const WebSocketManager = require( "./websocket_manager.js" );
	const websocket_server = new WebSocket.Server( { server } );
	server.listen( PORT , ()=> {
		console.log( "Sleep REDIS WebSocket Server Starting" );
		console.log( `\thttp://:localhost:${ PORT.toString() }` );
		console.log( `\thttp://:${ LOCAL_IP }:${ PORT.toString() }` );
	});
	websocket_server.on( "connection" ,  WebSocketManager.on_connection );

})();