const process = require( "process" );
const path = require( "path" );
const schedule = require( "node-schedule" );
const ip = require("ip");
const fs = require( "fs" );
const WebSocket = require( "ws" );
const Unilink1 = require( "unilink1" );

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

// Classes
// const DiscordWrapper = require( "./server/DiscordWrapper.js" );


// Run-Time Variables
// =========================================
const PORT = 6161;
module.exports.port = PORT;
const LOCAL_IP = ip.address();
module.exports.local_ip = LOCAL_IP;
const LIVE_HTML_PAGE = `<img alt="" id="liveimage" src=""/> <script type="text/javascript">(function(){setInterval(function(){var myImageElement=document.getElementById("liveimage");myImageElement.src="http://${ LOCAL_IP }:${ PORT }/live_image?" + new Date().getTime()},500)}());</script>`;

let startTime = new schedule.RecurrenceRule();
startTime.dayOfWeek = [ new schedule.Range( 0 , 6 ) ];
startTime.hour = 22;
startTime.minute = 30;
let stopTime = new schedule.RecurrenceRule();
stopTime.dayOfWeek = [ new schedule.Range( 0 , 6 ) ];
stopTime.hour = 9;
stopTime.minute = 0;

( async ()=> {

	console.log( "SERVER STARTING" );

	// 1.) Connect Discord Bot
	// const DiscordBot = new DiscordWrapper( Personal.discord_creds );
	// await DiscordBot.connect();
	// module.exports.discord = DiscordBot;

	// 1.) Connect to Unilink aka FireBase
	const link = new Unilink1({
		firebase_credentials: Personal.firebase_credentials ,
		personal: Personal.firebase_personal
	});
	await link.connect();
	module.exports.link = link;

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

	// Setup Scheduled Tasks
	let RESTART = false;
	const now = new Date();
	const hours = now.getHours();
	if( hours >= startTime.hour  ) { RESTART = true; }
	else if ( hours <= stopTime.hour ) {
		RESTART = true;
		if ( hours === stopTime.hour ) {
			if ( now.getMinutes() >= stopTime.minute ) { RESTART = false; }
		}
	}
	if ( RESTART ) {
		console.log( "motion_simple.py needs launched , starting" );
		GenericUtils.restartPYProcess();
	}

	const startEvent = schedule.scheduleJob( startTime , ()=> {
		console.log( "motion_simple.py scheduled start" );
		const cur_state = GenericUtils.getState();
		if ( !cur_state.state ) { GenericUtils.startPYProcess(); }
		else { GenericUtils.restartPYProcess(); }
	});

	const stopEvent = schedule.scheduleJob( stopTime , ()=> {
		console.log( "motion_simple.py scheduled stop" );
		GenericUtils.killAllPYProcess();
	});

	process.on( "unhandledRejection" , ( reason , p )=> {
		console.log( "unhandledRejection" );
		console.log( reason );
	});
	process.on( "uncaughtException" , ( error )=> {
		console.log( "unhandledException" );
		console.log( error );
	});

	process.on( "SIGINT" , async ()=> {
		console.log( "\nmain.js crashed !!" );
		//GenericUtils.killAllPYProcess();
		setTimeout( ()=> {
			process.exit( 1 );
		} , 3000 );
	});

	console.log( "SERVER READY" );

	await link.firestore.add( "whitelisted_users" , {
		"e3fb68a0-b1d9-4ca4-af38-da204cc5bef3": true ,
	});


	await link.firestore.set( "users" , "whitelisted" , {
		activated: false ,
		yesterday: true
	});

})();
