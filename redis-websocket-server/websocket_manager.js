function ON_CONNECTION( socket , req ) {
	socket.on( "message" , async ( message )=> {
		const RedisUtils = require( "redis-manager-utils" );
		const redis_manager = new RedisUtils( 1 , "localhost" , 6379 );
		await redis_manager.init();
		try { message = JSON.parse( message ); }
		catch( e ) { var a = message; message = { "type": a }; }
		console.log( message );
		if ( message.type === "pong" ) {
			console.log( "inside pong()" );
		}
		else if ( message.type === "get_frames" ) {
			return new Promise( async function( resolve , reject ) {
				try {
					const count = message.count || 1;
					redis_manager.redis.lrange( message.list_key , 0 , count , ( error , results )=> {
						console.log( results );
						socket.send( "new_frames" , results );
						resolve( results );
						return;
					});
				}
				catch( error ) { console.log( error ); reject( error ); return; }
			});
		}
		else if ( message.type === "get_thresholds" ) {

		}
		else if ( message.type === "get_deltas" ) {

		}
		else if ( message.type === "get_records" ) {

		}
		else if ( message.type === "get_events" ) {

		}
		else if ( message.type === "get_errors" ) {

		}
		else if ( message.type === "get_messages_generic" ) {

		}
	});
}
module.exports.on_connection = ON_CONNECTION;

