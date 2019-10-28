const path = require( "path" );
const PersonalFilePath = path.join( process.env.HOME , ".config" , "personal" , "raspi_motion_alarm_rewrite.json" );
const Personal = require( PersonalFilePath );
const RedisUtils = require( "redis-manager-utils" );
let redis_manager;
( async ()=> {
	redis_manager = new RedisUtils( Personal.redis.database_number , Personal.redis.host , Personal.redis.port );
	await redis_manager.init();
})();

function sleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }


function ON_CONNECTION( socket , req ) {
	socket.on( "message" , async ( message )=> {
		try { message = JSON.parse( message ); }
		catch( e ) { var a = message; message = { "type": a }; }
		console.log( message );
		if ( message.type === "pong" ) {
			console.log( "inside pong()" );
		}
		else if ( message.type === "get_latest_frame" ) {
			return new Promise( async function( resolve , reject ) {
				try {

					console.log( "Inside get_latest_frame message" );
					console.log( message );
					await redis_manager.redis.publish( "ionic-controller" , JSON.stringify({
						command: "frame" ,
					}));

					await sleep( 1000 );
					redis_manager.redis.lrange( message.list_key , 0 , 0 , ( error , results )=> {
						console.log( results );
						socket.send(JSON.stringify({
							message: "new_frames" ,
							data: results
						}));
						resolve( results );
						return;
					});
				}
				catch( error ) { console.log( error ); reject( error ); return; }
			});
		}
		else if ( message.type === "get_frames" ) {
			return new Promise( async function( resolve , reject ) {
				try {
					const count = message.count || 1;
					redis_manager.redis.lrange( message.list_key , 0 , ( count - 1 ) , ( error , results )=> {
						console.log( results );
						socket.send(JSON.stringify({
							message: "new_frames" ,
							data: results
						}));
						resolve( results );
						return;
					});
				}
				catch( error ) { console.log( error ); reject( error ); return; }
			});
		}
		else if ( message.type === "get_thresholds" ) {
			return new Promise( async function( resolve , reject ) {
				try {
					const count = message.count || 1;
					redis_manager.redis.lrange( message.list_key , 0 , ( count - 1 ) , ( error , results )=> {
						console.log( results );
						socket.send(JSON.stringify({
							message: "new_thresholds" ,
							data: results
						}));
						resolve( results );
						return;
					});
				}
				catch( error ) { console.log( error ); reject( error ); return; }
			});
		}
		else if ( message.type === "get_deltas" ) {
			return new Promise( async function( resolve , reject ) {
				try {
					const count = message.count || 1;
					redis_manager.redis.lrange( message.list_key , 0 , ( count - 1 ) , ( error , results )=> {
						console.log( results );
						socket.send(JSON.stringify({
							message: "new_deltas" ,
							data: results
						}));
						resolve( results );
						return;
					});
				}
				catch( error ) { console.log( error ); reject( error ); return; }
			});
		}
		else if ( message.type === "get_records" ) {
			return new Promise( async function( resolve , reject ) {
				try {
					const count = message.count || 1;
					redis_manager.redis.lrange( message.list_key , 0 , ( count - 1 ) , ( error , results )=> {
						console.log( results );
						socket.send( JSON.stringify({
							message: "new_records" ,
							data: results
						}));
						resolve( results );
						return;
					});
				}
				catch( error ) { console.log( error ); reject( error ); return; }
			});
		}
		else if ( message.type === "get_events" ) {
			return new Promise( async function( resolve , reject ) {
				try {
					const count = message.count || 1;
					redis_manager.redis.lrange( message.list_key , 0 , ( count - 1 ) , ( error , results )=> {
						console.log( results );
						socket.send(JSON.stringify({
							message: "new_events" ,
							data: results
						}));
						resolve( results );
						return;
					});
				}
				catch( error ) { console.log( error ); reject( error ); return; }
			});
		}
		else if ( message.type === "get_errors" ) {
			return new Promise( async function( resolve , reject ) {
				try {
					const count = message.count || 1;
					redis_manager.redis.lrange( message.list_key , 0 , ( count - 1 ) , ( error , results )=> {
						console.log( results );
						socket.send(JSON.stringify({
							message: "new_errors" ,
							data: results
						}));
						resolve( results );
						return;
					});
				}
				catch( error ) { console.log( error ); reject( error ); return; }
			});
		}
		else if ( message.type === "get_messages_generic" ) {
			return new Promise( async function( resolve , reject ) {
				try {
					const count = message.count || 1;
					redis_manager.redis.lrange( message.list_key , 0 , ( count - 1 ) , ( error , results )=> {
						console.log( results );
						socket.send(JSON.stringify({
							message: "new_messages_generic" ,
							data: results
						}));
						resolve( results );
						return;
					});
				}
				catch( error ) { console.log( error ); reject( error ); return; }
			});
		}
	});
}
module.exports.on_connection = ON_CONNECTION;

