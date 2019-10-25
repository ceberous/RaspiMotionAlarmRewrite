const express = require( "express" );
const fs = require( "fs" );
const path = require( "path" );
const bodyParser = require( "body-parser" );
const cors = require( "cors" );
const PORT = 6262;

let app = express();
app.use( express.static( path.join( __dirname , "client" ) ) );
app.use( cors( { origin: "http://localhost:" + PORT.toString() } ) );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended: true } ) );

const HTMLPath = path.join( __dirname , "./client/views" , "index.html" );

app.get( "/" , function( req , res ) {
	res.sendFile( HTMLPath );
});


module.exports = app;