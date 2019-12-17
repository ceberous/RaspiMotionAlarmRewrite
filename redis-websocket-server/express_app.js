const express = require( "express" );
const basicAuth = require( "express-basic-auth" );
const fs = require( "fs" );
const path = require( "path" );
const bodyParser = require( "body-parser" );
//const cors = require( "cors" );
const PORT = 6262;

let app = express();
app.use( basicAuth({
	users: {
		"e3c85a2b47ad45a106d903dbfa35c53489ee2ce17e2b44debab96a351bb82695": "4c2f70f42e9326b6c23da8ebff1097d4d80e0c9860c8ddbc022d55c2286d3b80"
	}
}));
app.use( express.static( path.join( __dirname , "client" ) ) );
//app.use( cors( { origin: "http://localhost:" + PORT.toString() } ) );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended: true } ) );

const HTMLPath = path.join( __dirname , "./client/views" , "index.html" );

app.get( "/" , function( req , res ) {
	res.sendFile( HTMLPath );
});

module.exports = app;