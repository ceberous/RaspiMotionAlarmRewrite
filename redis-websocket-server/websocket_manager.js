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
		else if ( message.type === "get_frame" ) {
			return new Promise( async function( resolve , reject ) {
				try {
					const starting_position = message.starting_position || 0;
					const ending_position = message.ending_position || 1;
					redis_manager.redis.lrange( message.list_key , starting_position , ending_position , ( error , results )=> {
						console.log( results );
						socket.send(JSON.stringify({
							message: "new_redis_lrange_items" ,
							channel: message.channel ,
							data: results
						}));
						resolve( results );
						return;
					});
				}
				catch( error ) { console.log( error ); reject( error ); return; }
			});
		}
		else if ( message.type === "get_redis_lrange" ) {
			return new Promise( function( resolve , reject ) {
				try {
					const starting_position = message.starting_position || 0;
					const ending_position = message.ending_position || 1;
					redis_manager.redis.lrange( message.list_key , starting_position , ending_position , ( error , results )=> {
						console.log( results );
						socket.send(JSON.stringify({
							message: "new_redis_lrange_items" ,
							channel: message.channel ,
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

