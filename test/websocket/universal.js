const process = require( "process" );
const WebSocket = require( "ws" );
const path = require( "path" );
const utf8 = require( "utf8" );
const fs = require( "fs" );
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
	const decryptedUTF8 = decoder.write( decryptedBin );
	return decryptedUTF8;
}

const ws = new WebSocket( "ws://127.0.0.1:10080" );
ws.on( "open" , ()=> { console.log( "connected" ); } );
ws.on( "message" , ( data )=> {
	if ( !data ) { return; }
	data = JSON.parse( data );
	console.log( "" );
	console.log( data.message );
	console.log( data.data );
	data = data.data;
	let decrypted_messages = [];
	for ( let i = 0; i < data.length; ++i ) {
		try {
			let decrypted = decrypt( Personal.libsodium.private_key , data[ i ] );
			decrypted = JSON.parse( decrypted );
			decrypted_messages.push( decrypted );
		}
		catch ( error ) { console.log( error ); }
	}
	for ( let i = ( decrypted_messages.length - 1 ); i > 0; --i ) {
		console.log( decrypted_messages[ i ].message );
	}
});