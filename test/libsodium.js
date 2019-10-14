( async ()=> {

	const RedisUtils = require( "redis-manager-utils" );
	const path = require( "path" );
	const util = require( "util" );
	const { StringDecoder } = require( "string_decoder" );
	const decoder = new StringDecoder( "utf8" );
	const PersonalFilePath = path.join( process.env.HOME , ".config" , "personal" , "raspi_motion_alarm_rewrite.json" );
	const Personal = require( PersonalFilePath );
	const redis_manager = new RedisUtils( Personal.redis.database_number , Personal.redis.host , Personal.redis.port );
	await redis_manager.init();

	const tweetnacl = require( "tweetnacl" );
	tweetnacl.util = require( "tweetnacl-util" );
	tweetnacl.sealedbox = require( "tweetnacl-sealedbox-js" );

	function generateKeys() {
		const keyPair = tweetnacl.box.keyPair();
		keyPair.publicKey = tweetnacl.util.encodeBase64(keyPair.publicKey);
		keyPair.secretKey = tweetnacl.util.encodeBase64(keyPair.secretKey);
		return keyPair;
	}

	function encrypt( publicKey , encryptMe ) {
		const publicKeyBin = tweetnacl.util.decodeBase64(publicKey);
		const encryptMeUTF8 = ( new TextEncoder( "utf-8" )).encode(encryptMe);
		const encryptedBin = tweetnacl.sealedbox.seal(encryptMeUTF8, publicKeyBin);
		const encrypted = tweetnacl.util.encodeBase64(encryptedBin);
		return encrypted;
	}

	function decrypt( secretKey , decryptMe ) {
		const secretKeyBin = tweetnacl.util.decodeBase64(secretKey);
		const publicKeyBin = tweetnacl.box.keyPair.fromSecretKey(secretKeyBin).publicKey;
		const decryptMeBin = tweetnacl.util.decodeBase64(decryptMe);
		const decryptedBin = tweetnacl.sealedbox.open(decryptMeBin, publicKeyBin, secretKeyBin);
		const decryptedUTF8 = decoder.write(decryptedBin);
		return decryptedUTF8;
	}

	function redis_get_list_range( key , start , end ) {
		return new Promise( function( resolve , reject ) {
			try {
				redis_manager.redis.lrange( key , start , end , ( error , results )=> {
					resolve( results );
					return;
				});
			}
			catch( error ) { console.log( error ); reject( error ); return; }
		});
	}

	//console.log( generateKeys() );

	//const test = await redis_get_list_range( "sleep.errors.2019.10.14" , 0 , 0 )
	const test = await redis_get_list_range( "sleep.images.frames.2019.10.14" , 0 , 0 )
	console.log( decrypt( Personal.libsodium.private_key , test[ 0 ] ) )

})();