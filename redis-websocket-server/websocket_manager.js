function ON_CONNECTION( socket , req ) {
	const events = require( "../main.js" ).events;
	socket.on( "message" ,  function( message ) {
		try { message = JSON.parse( message ); }
		catch( e ) { var a = message; message = { "type": a }; }
		console.log( message );
		switch( message.type ) {
			case "pong":
				console.log( "inside pong()" );
				this.isAlive = true;
				break;
			default:
				break;
		}
	});
}
module.exports.on_connection = ON_CONNECTION;