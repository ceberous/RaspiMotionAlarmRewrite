process.on( "unhandledRejection" , function( reason , p ) {
	console.error( reason, "Unhandled Rejection at Promise" , p );
	console.trace();
});
process.on( "uncaughtException" , function( err ) {
	console.error( err , "Uncaught Exception thrown" );
	console.trace();
});

( async ()=> {


	const RedisUtils = require( "redis-manager-utils" );

	console.log( "Starting" );
	const redis_manager = new RedisUtils( 1 , "localhost" , 10079  );
	await redis_manager.init();
	module.exports.redisConProxy = redis_manager;

	// Subscriber

	await redis_manager.keySet( 'TESTING.1' , "blah blah blah" );

	// redis_manager.redis.on( "subscribe", function ( channel , count ) {
	// 	redis_manager.redis.publish( "testing channel" , "I am sending my last message.");
	// });

	redis_manager.redis.on( "message" , function ( channel , message ) {
		//console.log( "sub channel " + channel + ": " + message );
		console.log( "new message from: " + channel );
		switch( channel ) {
			case "new-image-frame":
				// Add Image to DOM ?
				//
				break;
			case "new-image-threshold":
				// Add Image to DOM ?
				//
				break;
			case "new-image-delta":
				// Add Image to DOM ?
				//
				break;
			case "python-new-error":
				console.log( message );
				break;
			case "python-new-event":
				console.log( message );
				break;
			case "python-new-record":
				console.log( message );
				break;
			case "generic-message":
				console.log( message );
				break;
			default:
				console.log( channel );
				break;
		}
	});

	redis_manager.redis.subscribe( "new-image-frame" );
	redis_manager.redis.subscribe( "new-image-threshold" );
	redis_manager.redis.subscribe( "new-image-delta" );

	redis_manager.redis.subscribe( "python-new-error" );
	redis_manager.redis.subscribe( "python-new-event" );
	redis_manager.redis.subscribe( "python-new-record" );

	redis_manager.redis.subscribe( "generic-message" );

})();