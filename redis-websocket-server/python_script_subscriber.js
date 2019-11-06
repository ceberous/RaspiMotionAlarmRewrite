function INITIALIZE() {
	return new Promise( async function( resolve , reject ) {
		try {
			const Personal = require( "./main.js" ).personal;
			const RedisUtils = require( "redis-manager-utils" );
			const util = require( "util" );
			const tweetnacl = require( "tweetnacl" );
			tweetnacl.util = require( "tweetnacl-util" );
			tweetnacl.sealedbox = require( "tweetnacl-sealedbox-js" );

			console.log( "Starting" );
			const redis_manager = new RedisUtils( Personal.redis.database_number , Personal.redis.host , Personal.redis.port  );
			await redis_manager.init();

			function encrypt( message ) {
				const publicKeyBinary = tweetnacl.util.decodeBase64( Personal.libsodium.public_key );
				const messageUTF8 = ( new util.TextEncoder( "utf-8" ) ).encode( message );
				const encryptedBinary = tweetnacl.sealedbox.seal( messageUTF8 , publicKeyBinary );
				const encrypted = tweetnacl.util.encodeBase64( encryptedBinary );
				return encrypted;
			}

			async function publish_log( options ) {
				try {
					const now = new Date( new Date().toLocaleString( "en-US" , { timeZone: "America/New_York" } ) );
					const dd = String( now.getDate() ).padStart( 2 , '0' );
					const mm = String( now.getMonth() + 1 ).padStart( 2 , '0' );
					const yyyy = now.getFullYear();
					const hours = String( now.getHours() ).padStart( 2 , '0' );
					const minutes = String( now.getMinutes() ).padStart( 2 , '0' );
					const seconds = String( now.getSeconds() ).padStart( 2 , '0' );
					const time_key_suffix = `${ yyyy }.${ mm }.${ dd }`;
					const list_key = `sleep.python.${ options.channel }.${ time_key_suffix }`;
					const time_stamp_string = `${ yyyy }.${ mm }.${ dd } @@ ${ hours }:${ minutes }:${ seconds }`;
					let Custom_JSON_Serialized_Item_Object = JSON.stringify({
						...options ,
						...{
							timestamp: now ,
							list_key: list_key ,
							time_stamp_string: time_stamp_string ,
							message: `${ time_stamp_string } === PYTHON === ${ options.message }`
						}
					});
					console.log( "publish_new_item() === "  + list_key );
					console.log( Custom_JSON_Serialized_Item_Object );
					const encrypted = encrypt( Custom_JSON_Serialized_Item_Object );
					console.log( encrypted );
					await redis_manager.listLPUSH( list_key , encrypted );
					await redis_manager.listLPUSH( `sleep.log.${ time_key_suffix }` , encrypted );
				}
				catch( error ) { console.log( error ); }
			}

			async function publish_image( options ) {
				const now = new Date( new Date().toLocaleString( "en-US" , { timeZone: "America/New_York" } ) );
				const dd = String( now.getDate()).padStart( 2 , '0' );
				const mm = String( now.getMonth() + 1 ).padStart( 2 , '0' );
				const yyyy = now.getFullYear();
				const hours = String( now.getHours() ).padStart( 2 , '0' );
				const minutes = String( now.getMinutes() ).padStart( 2 , '0' );
				const seconds = String( now.getSeconds() ).padStart( 2 , '0' );
				const time_key_suffix = `${ yyyy }.${ mm }.${ dd }`;
				const list_key = `sleep.images.${ options.channel }.${ time_key_suffix }`;
				const time_stamp_string = `${ yyyy }.${ mm }.${ dd } @@ ${ hours }:${ minutes }:${ seconds }`;
				const Custom_JSON_Object = JSON.stringify({
					...options ,
					...{
						timestamp: now ,
						list_key: list_key ,
						time_stamp_string: time_stamp_string ,
						message: `${ time_stamp_string } === ${ options.message }`
					}
				});
				const encrypted = encrypt( Custom_JSON_Object );
				// console.log( encrypted );
				console.log( list_key );
				await redis_manager.listLPUSH( list_key , encrypted );
				let log_options = options;
				delete log_options.image_b64;
				const encrypted_log_options = encrypt( log_options );
				await redis_manager.listLPUSH( `sleep.log.${ time_key_suffix }` , encrypted_log_options );
			}

			redis_manager.redis.on( "message" , function ( channel , message ) {
					//console.log( "sub channel " + channel + ": " + message );
					console.log( "new message from: " + channel );
					if ( channel !== "python-script-controller" ) { return; }
					try {
						message = JSON.parse( message );
						console.log( message );
						if ( message.channel ) {
							switch ( message.channel ) {
								case "images.frames":
									publish_image( message );
									break;
								case "images.thresholds":
									publish_image( message );
									break;
								case "images.deltas":
									publish_image( message );
									break;
								default:
									publish_log( message );
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