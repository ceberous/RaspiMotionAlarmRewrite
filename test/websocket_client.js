const WebSocket = require( "ws" );
const path = require( "path" );
const utf8 = require( "utf8" );
const { StringDecoder } = require( "string_decoder" );
const decoder = new StringDecoder( "utf8" );
const PersonalFilePath = path.join( process.env.HOME , ".config" , "personal" , "raspi_motion_alarm_rewrite.json" );
const Personal = require( PersonalFilePath );

const tweetnacl = require( "tweetnacl" );
tweetnacl.util = require( "tweetnacl-util" );
tweetnacl.sealedbox = require( "tweetnacl-sealedbox-js" );

function decrypt( secretKey , decryptMe ) {
	const secretKeyBin = tweetnacl.util.decodeBase64(secretKey);
	const publicKeyBin = tweetnacl.box.keyPair.fromSecretKey(secretKeyBin).publicKey;
	const decryptMeBin = tweetnacl.util.decodeBase64(decryptMe);
	const decryptedBin = tweetnacl.sealedbox.open(decryptMeBin, publicKeyBin, secretKeyBin);
	const decryptedUTF8 = decoder.write(decryptedBin);
	return decryptedUTF8;
}

const ws = new WebSocket( "ws://127.0.0.1:10080" );
ws.on( "open" , function open() {
	ws.send( JSON.stringify({
		"type": "get_frames" ,
		"count": 1 ,
		"list_key": "sleep.images.frames.2019.10.25"
	}));
});

ws.on( "message" , ( data )=> {
	if ( !data ) { return; }
	data = JSON.parse( data );
	if ( !data ) { return; }
	console.log( data.message );
	for ( let i = 0; i < data.data.length; ++i ) {
		const decrypted = decrypt( Personal.libsodium.private_key , data.data[ i ] );
		console.log( decrypted );
	}
});