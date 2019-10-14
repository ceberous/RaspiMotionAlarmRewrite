const RedisUtils = require( "redis-manager-utils" );

function custom_publish_image_b64( options ) {
	return new Promise( async ( resolve , reject )=> {
		try {
			const redis_manager = new RedisUtils( 1 , "localhost" , 10079  );
			await redis_manager.init();

			const now = new Date();
			const dd = String( now.getDate()).padStart( 2 , '0' );
			const mm = String( now.getMonth() + 1 ).padStart( 2 , '0' );
			const yyyy = now.getFullYear();
			const hours = String( now.getHours() ).padStart( 2 , '0' );
			const minutes = String( now.getMinutes() ).padStart( 2 , '0' );
			const seconds = String( now.getSeconds() ).padStart( 2 , '0' );

			const imageb64 = require( "fs" ).readFileSync( options.image_path , "base64" );
			await redis_manager.redis.publish( options.channel , imageb64 );
			const list_key = `${ options.list_key_prefix }.${ yyyy }.${ mm }.${ dd }`
			const Custom_JSON_Serialized_Image_Object = JSON.stringify({
				timestamp: now ,
				message: options.message ,
				timestamp_string: `${ yyyy }.${ mm }.${ dd } @@ ${ hours }:${ minutes }:${ seconds }`,
				image_b64: imageb64 ,
				list_key: list_key
			});
			await redis_manager.listLPUSH( list_key , Custom_JSON_Serialized_Image_Object );
			resolve();
			return;
		}
		catch( error ) { console.log( error ); resolve( error ); return; }
	});
}
function publish_new_image_set() {
	return new Promise( async ( resolve , reject )=> {
		try {

			await custom_publish_image_b64({
				channel: "new-image-frame" ,
				image_path: "/Users/morpheous/Pictures/Saved/LSRF-M.png" ,
				list_key_prefix: "sleep.images.frames"
			});

			await custom_publish_image_b64({
				channel: "new-image-threshold" ,
				image_path: "/Users/morpheous/Pictures/Saved/LSRF-M.png" ,
				list_key_prefix: "sleep.images.thresholds"
			});

			await custom_publish_image_b64({
				channel: "new-image-delta" ,
				image_path: "/Users/morpheous/Pictures/Saved/LSRF-M.png" ,
				list_key_prefix: "sleep.images.deltas"
			});

			resolve();
			return;
		}
		catch( error ) { console.log( error ); reject( error ); return; }
	});
}
module.exports.new_image_set = publish_new_image_set;


function publish_new_item( options ) {
	return new Promise( async ( resolve , reject )=> {
		try {
			console.log( "publish_new_item()" );
			const redis_manager = new RedisUtils( 1 , "localhost" , 10079  );
			await redis_manager.init();

			const now = new Date();
			const dd = String( now.getDate()).padStart( 2 , '0' );
			const mm = String( now.getMonth() + 1 ).padStart( 2 , '0' );
			const yyyy = now.getFullYear();
			const hours = String( now.getHours() ).padStart( 2 , '0' );
			const minutes = String( now.getMinutes() ).padStart( 2 , '0' );
			const seconds = String( now.getSeconds() ).padStart( 2 , '0' );

			const list_key = `${ options.list_key_prefix }.${ yyyy }.${ mm }.${ dd }`;
			const Custom_JSON_Serialized_Item_Object = JSON.stringify({
				timestamp: now ,
				timestamp_string: `${ yyyy }.${ mm }.${ dd } @@ ${ hours }:${ minutes }:${ seconds }` ,
				message: options.message ,
				list_key: list_key
			});

			console.log( Custom_JSON_Serialized_Item_Object );
			await redis_manager.redis.publish( options.type , Custom_JSON_Serialized_Item_Object );
			console.log( list_key );
			await redis_manager.listLPUSH( list_key , Custom_JSON_Serialized_Item_Object );
			console.log( "now finished" );
			resolve();
			return;
		}
		catch( error ) { console.log( error ); reject( error ); return; }
	});
}
module.exports.new_item = publish_new_item;