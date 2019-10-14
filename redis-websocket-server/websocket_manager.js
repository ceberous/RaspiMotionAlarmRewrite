function ON_CONNECTION( socket , req ) {
	const redis_manager = require( "./main.js" ).redis_manager;
	socket.on( "message" , ( message )=> {
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
					redis_manager.redis.lrange( "sleep.frames" , 0 , count , ( results )=> {
						console.log( result );
						socket.send( "new_frames" , result );
						resolve( result );
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

