function load_custom_event_list() {
	try {
		const events = require( "../main.js" ).events;
		const GenericUtils = require( "../utils/generic.js" );
		const Publishing = require( "./PublishingManager.js" );
		const redis_manager = require( "../main.js" ).redis_manager;

		// Python Motion Script Events
		// ============================================================
		events.on( "python-script" , ( options ) => {
			if ( !options ) { return; }
			try{
				Publishing.new_item({
					type: "python-script" ,
					message: `${ GenericUtils.time() } === PYTHON-SCRIPT === ${ options.message }` ,
					list_key_prefix: "sleep.log" ,
				});
				Publishing.new_item({
					type: "python-script" ,
					message: `${ GenericUtils.time() } === PYTHON-SCRIPT === ${ options.message }` ,
					list_key_prefix: `sleep.python.${ options.channel }` ,
				});
				if ( options.command ) {

				}
			}
			catch( error ) {
				console.log( error );
			}
		});
		// Scheduled Events
		// ============================================================
		events.on( "scheduled_start" , () => {
			try{
				const cur_state = GenericUtils.getState();
				let message;
				if ( !cur_state.state ) { message = "Scheduled Start of Python Motion Script"; GenericUtils.startPYProcess(); }
				else { message = "Scheduled Start of Python Motion Script: RESTARTING"; GenericUtils.restartPYProcess(); }
				Publishing.new_item({
					type: "node" ,
					message: `${ GenericUtils.time() } === NODE === ${ message }` ,
					list_key_prefix: "sleep.log" ,
				});
				Publishing.new_item({
					type: "node" ,
					message: `${ GenericUtils.time() } === NODE === ${ message }` ,
					list_key_prefix: "sleep.log" ,
				});
			}
			catch( error ) {
				console.log( error );
				Publishing.new_item({
					type: "node" ,
					message: `${ GenericUtils.time() } === NODE === Scheduled Start of Python Motion Script FAILED` ,
					list_key_prefix: "sleep.log" ,
				});
				Publishing.new_item({
					type: "node" ,
					message: `${ GenericUtils.time() } === NODE === Scheduled Start of Python Motion Script FAILED` ,
					list_key_prefix: "sleep.node.errors" ,
				});
			}
		});
		events.on( "scheduled_stop" , () => {
			const cur_state = GenericUtils.getState();
			if ( !cur_state.state ) { GenericUtils.startPYProcess(); }
			else { GenericUtils.restartrestartPYProcess(); }

		});

		// Command Control Events
		// ============================================================
		events.on( "command_start_pyprocess" , GenericUtils.startPYProcess );
		events.on( "command_stop_pyprocess" , GenericUtils.stopPYProcess );
		events.on( "command_restart_pyprocess" , GenericUtils.restartPYProcess );
		events.on( "publish_new_frame" , () => {
			Publishing.new_frame();
			Publishing.new_item({
				type: "node" ,
				message: `${ GenericUtils.time() } === NODE === New Frame Saved` ,
				list_key_prefix: "sleep.log" ,
			});
		});
		events.on( "publish_new_image_set" , () => {
			Publishing.new_image_set();
			Publishing.new_item({
				type: "node" ,
				message: `${ GenericUtils.time() } === NODE === New Image Set Saved` ,
			list_key_prefix: "sleep.log" ,
			});
		});
		events.on( "twilio-call" , ( options ) => {
			console.log( "call()" );
			console.log( options );
			GenericUtils.makeTwilioPythonCall({
				command: "call" ,
				number: options.number ,
			});
			Publishing.new_item({
				type: "node" ,
				message: `${ GenericUtils.time() } === NODE === New Frame Saved` ,
				list_key_prefix: "sleep.log" ,
			});
		});
		events.on( "twilio-message" , ( options ) => {
			console.log( "message()" );
			console.log( options );
			GenericUtils.makeTwilioPythonCall({
				command: "message" ,
				number: options.number ,
				message: options.message
			});
		});

		// Client Message Passing
		// ============================================================
		events.on( "message_generic" , ( options ) => {
			Publishing.new_item({
				type: "message-generic" ,
				message: options.message,
				list_key_prefix: "sleep.node.messages.generic" ,
			});
		});

		// Error Events
		// ============================================================
		events.on( "error_unhandled_rejection" , ( options ) => {
			Publishing.new_item({
				type: "message-error" ,
				message: options.message,
				list_key_prefix: "sleep.node.errors" ,
			});
			//GenericUtils.restartPYProcess();
		});
		events.on( "error_unhandled_rejection" , ( options ) => {
			Publishing.new_item({
				type: "message-error" ,
				message: options.message,
				list_key_prefix: "sleep.node.errors" ,
			});
			//GenericUtils.restartPYProcess();
		});
		events.on( "error_sigint" , ( options ) => {
			Publishing.new_item({
				type: "message-error" ,
				message: options.message ,
				list_key_prefix: "sleep.node.errors" ,
			});
			//GenericUtils.stopPYProcess();
		});

		return;
	}
	catch( error ) { console.log( error ); return; }
}
module.exports.load_custom_event_list = load_custom_event_list;