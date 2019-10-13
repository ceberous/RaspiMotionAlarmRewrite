function load_custom_event_list() {
	try {
		const events = require( "../main.js" ).events;
		const GenericUtils = require( "../utils/generic.js" );
		const redis_manager = require( "../main.js" ).redis_manager;

		// Python Motion Script Events
		// ============================================================
		events.on( "python-new-error" , ( options ) => {
			if ( !options ) { return; }
			GenericUtils.publish_new_item({
				redis_manager_pointer: redis_manager ,
				type: "python-new-error" ,
				message: options.messsage ,
				list_key_prefix: "sleep.errors" ,
			});
		});
		events.on( "python-new-event" , ( options ) => {
			if ( !options ) { return; }
			GenericUtils.publish_new_item({
				redis_manager_pointer: redis_manager ,
				type: "python-new-event" ,
				message: options.messsage ,
				list_key_prefix: "sleep.events" ,
			});
		});
		events.on( "python-new-record" , ( options ) => {
			if ( !options ) { return; }
			GenericUtils.publish_new_item({
				redis_manager_pointer: redis_manager,
				type: "python-new-record" ,
				message: options.messsage ,
				list_key_prefix: "sleep.records" ,
			});
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
			else { GenericUtils.restartPYProcess(); }
		});

		// Command Control Events
		// ============================================================
		events.on( "command_start_pyprocess" , GenericUtils.startPYProcess );
		events.on( "command_stop_pyprocess" , GenericUtils.stopPYProcess );
		events.on( "command_restart_pyprocess" , GenericUtils.restartPYProcess );
		events.on( "publish_new_image_set" , () => {
			require( "../utils/generic.js" ).publish_new_image_set();
		});

		// Client Message Passing
		// ============================================================
		events.on( "generic_message" , ( options ) => {
			GenericUtils.publish_new_item({
				redis_manager_pointer: redis_manager,
				type: "message-generic" ,
				message: options.message,
				list_key_prefix: "sleep.messages.generic" ,
			});
		});

		// Error Events
		// ============================================================
		events.on( "error_unhandled_rejection" , ( options) => {
			GenericUtils.publish_new_item({
				redis_manager_pointer: redis_manager,
				type: "message-error" ,
				message: options.message,
				list_key_prefix: "sleep.messages.error" ,
			});
			require( "../utils/generic.js" ).restartPYProcess();
		});
		events.on( "error_unhandled_rejection" , ( options ) => {
			GenericUtils.publish_new_item({
				redis_manager_pointer: redis_manager,
				type: "message-error" ,
				message: options.message,
				list_key_prefix: "sleep.messages.error" ,
			});
			require( "../utils/generic.js" ).restartPYProcess();
		});
		events.on( "error_sigint" , ( options) => {
			GenericUtils.publish_new_item({
				redis_manager_pointer: redis_manager,
				type: "message-error" ,
				message: options.message, ,
				list_key_prefix: "sleep.messages.error" ,
			});
			GenericUtils.stopPYProcess();
		});

		return;
	}
	catch( error ) { console.log( error ); return; }
}
module.exports.load_custom_event_list = load_custom_event_list;