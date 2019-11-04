
function INITIALIZE() {
	return new Promise( function( resolve , reject ) {
		try {
			const Personal = require( "./main.js" ).personal;
			const RedisUtils = require( "redis-manager-utils" );
			const Publishing = require( "../server/RedisPublishingManager.js" );

			function python_publish( options ) {
				try {
					const global_log_options = {
						...options ,
						...{
							type: "python" ,
							message: `PYTHON === ${ options.message }` ,
							list_key_prefix: "sleep.log"
						}
					};
					console.log( global_log_options );
					Publishing.new_item( global_log_options );
					let python_log_options = { ...global_log_options };
					python_log_options.list_key_prefix = `sleep.python.${ options.channel }`;
					Publishing.new_item( python_log_options );
				}
				catch( error ) { console.log( error ); }
			}

			console.log( "Starting" );
			const redis_manager = new RedisUtils( Personal.redis.database_number , Personal.redis.host , Personal.redis.port  );
			await redis_manager.init();
			redis_manager.redis.on( "message" , function ( channel , message ) {
					//console.log( "sub channel " + channel + ": " + message );
					console.log( "new message from: " + channel );
					if ( channel !== "python-script-controller" ) { return; }
					try {
						message = JSON.parse( message );
						console.log( message );
						python_publish( message );
						if ( message.command ) {
							switch ( message.command ) {
								case "publish_new_image_set":
									PublisherManager.new_image_set();
									break;
								case "publish_new_frame":
									PublishingManager.new_frame();
									break;
								default:
									break;
							}
						}

					}
					catch( error ) { console.log( error ); }
				}
			);
			resolve( redis_manager );
			return;
		}
		catch( error ) { console.log( error ); reject( error ); return; }
	});
}
module.exports.init = INITIALIZE;