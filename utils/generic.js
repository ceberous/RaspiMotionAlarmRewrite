require( "shelljs/global" );
const path = require( "path" );
const ps = require( "ps-node" );
const spawn = require( "child_process" ).spawn;


function sleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }
module.exports.sleep = sleep;

function OS_COMMAND( wTask ) {
	return new Promise( function( resolve , reject ) {
		try {
			let result = null;
			let x1 = exec( wTask , { silent: true , async: false } );
			if ( x1.stderr ) { result = x1.stderr }
			else { result = x1.stdout.trim() }
			resolve( result );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.os_command = OS_COMMAND;


let arg1 = 1    // = Minimum Seconds of Continuous Motion
let arg2 = 4    // = Total Motion Events Acceptable Before Alert
let arg3 = 45   // = Minimum Time of Motion Before Alert
let arg4 = 90   // = Cooloff Period Duration
const lCode1 = path.join( __dirname , "../../py_scripts" , "motion_simple.py" );
console.log( lCode1 );
let wState = false;
let wChild = null;
let wFFMPEG_Child = null;
let wPIDResultSet = [];

const MonthNames = [ "JAN" , "FEB" , "MAR" , "APR" , "MAY" , "JUN" , "JUL" , "AUG" , "SEP" , "OCT" , "NOV" , "DEC" ];
function GET_NOW_TIME() {
	const today = new Date();
	let day = today.getDate();
	if ( parseInt( day ) < 10 ) { day = "0" + day; }
	const month = MonthNames[ today.getMonth() ];
	const year = today.getFullYear();
	let hours = today.getHours();
	if ( parseInt( hours ) < 10 ) { hours = "0" + hours; }
	let minutes = today.getMinutes();
	if ( parseInt( minutes ) < 10 ) { minutes = "0" + minutes; }
	let seconds = today.getSeconds();
	if ( parseInt( seconds ) < 10 ) { seconds = "0" + seconds; }
	let milliseconds = today.getMilliseconds();
	const mi = parseInt( milliseconds );
	if ( mi < 10 ) { milliseconds = "00" + milliseconds; }
	else if ( mi < 100 ) { milliseconds = "0" + milliseconds; }
	//return day + month + year + " @ " + hours + ":" + minutes + ":" + seconds + "." + milliseconds
	return day + month + year + " @ " + hours + ":" + minutes + ":" + seconds;
}
module.exports.time = GET_NOW_TIME;

function SET_ARGS( wArg1 , wArg2 , wArg3 , wArg4 ) {
	arg1 = wArg1 || arg1;
	arg2 = wArg2 || arg2;
	arg3 = wArg3 || arg3;
	arg4 = wArg4 || arg4;
}
module.exports.setArgs = SET_ARGS;

function GET_STATE() {
	return { state: wState , arg1: arg1 , arg2: arg2 , arg3: arg3 , arg4: arg4 };
}
module.exports.getState = GET_STATE;

function CHILD_PID_LOOKUP() {
	wPIDResultSet = [];
	return ps.lookup( { command: "python" } ,
		function( err , resultList ) {
			if ( err ) { throw new Error( err ); }
			resultList.forEach(function( process ){
				if( process ){
					process.arguments.forEach( function( item ) {
						if ( item === lCode1 ) {
							wPIDResultSet.push( process.pid );
							console.log( "python PID = " + process.pid.toString() );
						}
					});
				}
			});
			return wPIDResultSet;
		}
	);
	//return wPIDResultSet;
};
module.exports.childPIDLookup = CHILD_PID_LOOKUP;

// https://pypi.python.org/pypi/python-crontab/
// https://stackoverflow.com/questions/12871740/how-to-detach-a-spawned-child-process-in-a-node-js-script
// https://stackoverflow.com/questions/696839/how-do-i-write-a-bash-script-to-restart-a-process-if-it-dies
function START_PY_PROCESS() {
	const events = require( "../main.js" ).events;
	wChild = null;
	wChild = spawn( "python" , [ lCode1 , arg1 , arg2 , arg3 , arg4 ] , { detached: true, stdio: [ 'ignore' , 'ignore' , 'ignore' ] } );
	console.log( "launched pyscript" );
	CHILD_PID_LOOKUP();

	wState = true;
	wChild.on( "error" , function( error ) {
		events.emit( "python-new-error" , { message: "Error === " + error.toString() } );
		console.log( error );
	});
	wChild.on( "exit" , function( code ) {
		events.emit( "python-new-error" , { message: "Exit Code === " + code.toString() } );
		console.log( code );
	});
	setTimeout( function () {
		wChild.unref();
	} , 3000 );
}
module.exports.startPYProcess = START_PY_PROCESS;

function KILL_ALL_PY_PROCESS() {
	exec( "sudo pkill -9 python" , { silent: true ,  async: false } );
	wPIDResultSet.forEach(function( item , index ) {
		try {
			ps.kill( item , function( err ){
				if (err) { console.log( err ); }
				else {
					wState = false;
					console.log( "killed PID: " + item.toString() );
					wPIDResultSet.splice( index , 1 );
				}
			});
		}
		catch(err){
			exec( "sudo pkill -9 python" , { silent: true ,  async: false } );
			console.log(err);
		}
	});
}
module.exports.stopPYProcess = KILL_ALL_PY_PROCESS;

function RESTART_PY_PROCESS() {
	console.log("restarting")
	KILL_ALL_PY_PROCESS();
	wState = false;
	setTimeout(function(){
		START_PY_PROCESS();
	}, 3000 );
}
module.exports.restartPYProcess = RESTART_PY_PROCESS;

function GRACEFUL_EXIT() {
	console.log("restarting")
	KILL_ALL_PY_PROCESS();
	wState = false;
	setTimeout(function(){
		START_PY_PROCESS();
	}, 5000 );
}
module.exports.gracefulExit = GRACEFUL_EXIT;


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
					message: options.message ,
					timestamp_string: `${ yyyy }.${ mm }.${ dd } @@ ${ hours }:${ minutes }:${ seconds }`,
					image_b64: imageb64 ,
					list_key: list_key
				});
				await options.redis_manager_pointer.listLPUSH( list_key , Custom_JSON_Serialized_Image_Object );
			}
			resolve();
			return;
		}
		catch( error ) { console.log( error ); resolve( error ); return; }
	});
}
function publish_new_image_set() {
	return new Promise( async ( resolve , reject )=> {
		try {
			const redis_manager = require( "../main.js" ).redis_manager;

			await custom_publish_image_b64({
				redis_manager_pointer: redis_manager ,
				channel: "new-image-frame" ,
				image_path: "/Users/morpheous/Pictures/Saved/LSRF-M.png" ,
				list_key_prefix: "sleep.images.frames"
			});

			await custom_publish_image_b64({
				redis_manager_pointer: redis_manager ,
				channel: "new-image-threshold" ,
				image_path: "/Users/morpheous/Pictures/Saved/LSRF-M.png" ,
				list_key_prefix: "sleep.images.thresholds"
			});

			await custom_publish_image_b64({
				redis_manager_pointer: redis_manager ,
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
module.exports.publish_new_image_set = publish_new_image_set;

function publish_new_item( options ) {
	return new Promise( async ( resolve , reject )=> {
		try {
			console.log( "publish_new_item()" );
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
				timestamp_string: `${ yyyy }.${ mm }.${ dd } @@ ${ hours }:${ minutes }:${ seconds }`,
				message: options.message ,
				list_key: list_key
			});
			await options.redis_manager_pointer.redis.publish( options.type , JSON.stringify( Custom_JSON_Serialized_Item_Object ));

			await options.redis_manager_pointer.listLPUSH( list_key , Custom_JSON_Serialized_Item_Object );
			resolve();
			return;
		}
		catch( error ) { console.log( error ); reject( error ); return; }
	});
}
module.exports.publish_new_item = publish_new_item;

