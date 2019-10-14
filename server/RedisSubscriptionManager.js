function IONIC_CONTROLLER( options ) {
	try {
		console.log( "Inside IONIC_CONTROLLER()" );
		console.log( options = JSON.parse( options ) );
		const events = require( "../main.js" ).events;
		console.log( typeof options );
		if ( !options.command ) { return; }
		if ( options.command === "call" ) {
			events.emit( "twilio-call" , options );
		}
		if ( options.command === "message" ) {
			events.emit( "twilio-message" , options );
		}
	}
	catch ( error ) { console.error( error ); }
}

function LOAD_SUBSCRIPTIONS() {
	return new Promise( function( resolve , reject ) {
		try {
			const redis_manager = require( "../main.js" ).redis_manager;
			redis_manager.redis.on( "message" , function ( channel , message ) {
				//console.log( "sub channel " + channel + ": " + message );
				console.log( "new message from: " + channel );
				switch( channel ) {
					case "ionic-controller":
						IONIC_CONTROLLER( message );
						break;
					default:
						console.log( channel );
						break;
				}
			});
			redis_manager.redis.subscribe( "ionic-controller" );
			resolve();
			return;
		}
		catch( error ) { console.log( error ); reject( error ); return; }
	});
}
module.exports.load_subscriptions = LOAD_SUBSCRIPTIONS;