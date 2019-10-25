function load_custom_event_list() {
	try {
		const events = require( "../main.js" ).events;
		const GenericUtils = require( "../utils/generic.js" );
		const Publishing = require( "./PublishingManager.js" );
		const redis_manager = require( "../main.js" ).redis_manager;

		// Python Motion Script Events
		// ============================================================
		events.on( "python-new-error" , ( options ) => {
			if ( !options ) { return; }
			Publishing.new_item({
				type: "python-new-error" ,
				message: options.message ,
				list_key_prefix: "sleep.errors" ,
			});
		});
		events.on( "python-new-event" , ( options ) => {
			if ( !options ) { return; }
			Publishing.new_item({
				type: "python-new-event" ,
				message: options.message ,
				list_key_prefix: "sleep.events" ,
			});
		});
		events.on( "python-new-record" , ( options ) => {
			if ( !options ) { return; }
			console.log( options );
			Publishing.new_item({
				type: "python-new-record" ,
				message: options.message ,
				list_key_prefix: "sleep.records" ,
			});
			Publishing.new_image_set();
		});

		// Scheduled Events
		// ============================================================
		events.on( "scheduled_start" , () => {
			const cur_state = GenericUtils.getState();
			if ( !cur_state.state ) { GenericUtils.startPYProcess(); }
			else { GenericUtils.restartPYProcess(); }
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
		events.on( "publish_new_image_set" , () => {
			Publishing.new_image_set();
		});
		events.on( "twilio-call" , ( options ) => {
			console.log( "call()" );
			console.log( options );
			GenericUtils.makeTwilioPythonCall({
				command: "call" ,
				number: options.number ,
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
				list_key_prefix: "sleep.messages.generic" ,
			});
		});

		// Error Events
		// ============================================================
		events.on( "error_unhandled_rejection" , ( options ) => {
			Publishing.new_item({
				type: "message-error" ,
				message: options.message,
				list_key_prefix: "sleep.messages.errors" ,
			});
			//GenericUtils.restartPYProcess();
		});
		events.on( "error_unhandled_rejection" , ( options ) => {
			Publishing.new_item({
				type: "message-error" ,
				message: options.message,
				list_key_prefix: "sleep.messages.errors" ,
			});
			//GenericUtils.restartPYProcess();
		});
		events.on( "error_sigint" , ( options ) => {
			Publishing.new_item({
				type: "message-error" ,
				message: options.message ,
				list_key_prefix: "sleep.messages.errors" ,
			});
			//GenericUtils.stopPYProcess();
		});

		return;
	}
	catch( error ) { console.log( error ); return; }
}
module.exports.load_custom_event_list = load_custom_event_list;