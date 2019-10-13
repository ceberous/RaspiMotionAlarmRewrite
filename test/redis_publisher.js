process.on( "unhandledRejection" , function( reason , p ) {
	console.error( reason, "Unhandled Rejection at Promise" , p );
	console.trace();
});
process.on( "uncaughtException" , function( err ) {
	console.error( err , "Uncaught Exception thrown" );
	console.trace();
});

function custom_publish_image_b64( options ) {
	return new Promise( async function( resolve , reject ) {
		try {
			const now = new Date();
			const dd = String( now.getDate()).padStart( 2 , '0' );
			const mm = String( now.getMonth() + 1 ).padStart( 2 , '0' );
			const yyyy = now.getFullYear();
			const hours = String( now.getHours() ).padStart( 2 , '0' );
			const minutes = String( now.getMinutes() ).padStart( 2 , '0' );
			const seconds = String( now.getSeconds() ).padStart( 2 , '0' );

			const imageb64 = require( "fs" ).readFileSync( options.image_path , "base64" );
			await options.redis_manager_pointer.redis.publish( options.channel , imageb64 );
			const list_key = `${ options.list_key_prefix }.${ yyyy }.${ mm }.${ dd }`
			if ( options.list_key ) {
				const Custom_JSON_Serialized_Image_Object = JSON.stringify({
					timestamp: now ,
					timestamp_string: `${ yyyy }.${ mm }.${ dd } @@ ${ hours } : ${ minutes } : ${ seconds }`,
					image_b64: imageb64 ,
					list_key: list_key
				});
				await options.redis_manager_pointer.listRPUSH( list_key , Custom_JSON_Serialized_Image_Object );
			}
			resolve();
			return;
		}
		catch( error ) { console.log( error ); resolve( error ); return; }
	});
}

( async ()=> {

	const RedisUtils = require( "redis-manager-utils" );

	console.log( "Starting" );
	const redis_manager = new RedisUtils( 1 , "localhost" , 10079  );
	await redis_manager.init();
	module.exports.redisConProxy = redis_manager;

	// Publisher
	console.log( "Liner 1 ?" );
	await redis_manager.redis.publish( "new.frame" , "test 2832231" );
	console.log( "Liner 2 ?" );

	await custom_publish_image_b64({
		redis_manager_pointer: redis_manager ,
		channel: "new image frame" ,
		image_path: "/Users/morpheous/Pictures/Saved/LSRF-M.png" ,
		list_key_prefix: "sleep.images.frames"
	});

	await custom_publish_image_b64({
		redis_manager_pointer: redis_manager ,
		channel: "new image threshold" ,
		image_path: "/Users/morpheous/Pictures/Saved/LSRF-M.png" ,
		list_key_prefix: "sleep.images.thresholds"
	});

	await custom_publish_image_b64({
		redis_manager_pointer: redis_manager ,
		channel: "new image delta" ,
		image_path: "/Users/morpheous/Pictures/Saved/LSRF-M.png" ,
		list_key_prefix: "sleep.images.deltas"
	});

})();