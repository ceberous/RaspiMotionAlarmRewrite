const process = require( "process" );
const path = require( "path" );
const ip = require("ip");
const fs = require( "fs" );
const EventEmitter = require( "events" );
const WebSocket = require( "ws" );
	const REDIS = require( "redis" );

//const Unilink1 = require( "unilink1" );
const RedisUtils = require( "redis-manager-utils" );


process.on( "unhandledRejection" , function( reason , p ) {
	console.error( reason, "Unhandled Rejection at Promise" , p );
	console.trace();
});
process.on( "uncaughtException" , function( err ) {
	console.error( err , "Uncaught Exception thrown" );
	console.trace();
});

const PersonalFilePath = path.join( process.env.HOME , ".config" , "personal" , "raspi_motion_alarm_rewrite.js" );
const Personal = require( PersonalFilePath );
module.exports.personal = Personal;

// Functions
const GenericUtils = require( "./utils/generic.js" )

// Run-Time Variables
// =========================================
const PORT = 6161;
module.exports.port = PORT;
const LOCAL_IP = ip.address();
module.exports.local_ip = LOCAL_IP;
const LIVE_HTML_PAGE = `<img alt="" id="liveimage" src=""/> <script type="text/javascript">(function(){setInterval(function(){var myImageElement=document.getElementById("liveimage");myImageElement.src="http://${ LOCAL_IP }:${ PORT }/live_image?" + new Date().getTime()},500)}());</script>`;

( async ()=> {

	console.log( "SERVER STARTING" );

	// 0.) Setup Redis Manager
	const redis_manager = new RedisUtils( 1 , "localhost" , 10079  );
	await redis_manager.init();
	module.exports.redis_manager = redis_manager;
	const redis_publishing_manager = await REDIS.createClient({
		host: "localhost",
		port: 10079 ,
		db: 1 ,
		retry_strategy: function ( options ) {
			if ( options.error && options.error.code === "ECONNREFUSED" ) {
				// End reconnecting on a specific error and flush all commands with
				// a individual error
				return new Error( "The server refused the connection" );
			}
			if ( options.total_retry_time > 1000 * 60 * 60 ) {
				// End reconnecting after a specific timeout and flush all commands
				// with a individual error
				return new Error( "Retry time exhausted" );
			}
			if ( options.attempt > 20 ) {
				// End reconnecting with built in error
				return undefined;
			}
			// reconnect after
			return Math.min( options.attempt * 100 , 3000 );
		}
	});
	module.exports.redis_publishing_manager = redis_publishing_manager;
	// await redis_manager.keySet( 'TESTING' , "TESTING BLAH BLAH" );
	// await GenericUtils.sleep( 1000 );

	// 1.) Setup Synchronized Event Emitter
	const events = new EventEmitter();
	module.exports.events = events;
	require( "./server/EventSynchronizer.js" ).load_custom_event_list();

	// 3.) Load Redis Subscriptions
	await require( "./server/RedisSubscriptionManager.js" ).load_subscriptions();

	// 2.) Write 'Current DHCP IP Address to Static HTML File'
	fs.writeFileSync( path.join( __dirname , "client" , "views" , "live.html" ) , LIVE_HTML_PAGE );

	// 3.) Start Express Server With WebSocket Server Attachment
	const express_app = require( "./server/express/app.js" );
	const server = require( "http" ).createServer( express_app );
	const WebSocketManager = require( "./server/WebSocketManager.js" );
	const websocket_server = new WebSocket.Server( { server  } );
	server.listen( PORT , ()=> {
		console.log( "\thttp://localhost:" + PORT.toString() );
	});
	websocket_server.on( "connection" ,  WebSocketManager.on_connection );

	// 4.) Load Schedule Manager
	const schedules = require( "./server/ScheduleManager.js" ).load_schedules();

	process.on( "unhandledRejection" , ( reason , p )=> {
		events.emit( "error_unhandled_rejection" , {
			reason: reason ,
			p: p ,
			message: `Unhanded Rection === Reason === ${ reason }\n${ p }`
		});
	});
	process.on( "uncaughtException" , ( error )=> {
		events.emit( "error_unhandled_exception" , {
			error: error ,
			message: `Uncaught Exception\n${ error }`
		});
	});

	process.on( "SIGINT" , async ()=> {
		console.log( "\nmain.js crashed !!" );
		events.emit( "error_sigint" , {
			message: "SIGINT === main.js crashed"
		});
		setTimeout( ()=> {
			process.exit( 1 );
		} , 3000 );
	});

	console.log( "SERVER READY" );


})();
