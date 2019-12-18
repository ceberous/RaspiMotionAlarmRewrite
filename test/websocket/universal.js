const process = require( "process" );
const WebSocket = require( "ws" );
const path = require( "path" );
const utf8 = require( "utf8" );
const fs = require( "fs" );
const { StringDecoder } = require( "string_decoder" );
const decoder = new StringDecoder( "utf8" );

const ws = new WebSocket( "ws://127.0.0.1:10080" );
ws.on( "open" , ()=> { console.log( "connected" ); } );
ws.on( "message" , ( data )=> {
	if ( !data ) { return; }
	data = JSON.parse( data );
	console.log( data.message );
	console.log( data.data );
	//process.exit( 1 );
});