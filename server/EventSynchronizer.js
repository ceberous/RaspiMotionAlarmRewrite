function load_custom_event_list() {
	try {
		const events = require( "../main.js" ).events;
		const GenericUtils = require( "../utils/generic.js" );
		const Publishing = require( "./RedisPublishingManager.js" );
		const redis_manager = require( "../main.js" ).redis_manager;

		function python_publish( options ) {
			try {
				options = {
					...options ,
					...{
						type: "python" ,
						message: `PYTHON === ${ options.message }` ,
						list_key_prefix: "sleep.log"
					}
				};
				Publishing.new_item( options );
				options.list_key_prefix = `sleep.python.${ options.channel }`;
				Publishing.new_item( options );
			}
			catch( error ) { console.log( error ); }
		}
		function node_publish( options ) {
			try {
				options = {
					...options ,
					...{
						type: "node" ,
						message: `NODE === ${ options.message }` ,
						list_key_prefix: "sleep.log"
					}
				};
				console.log( options );
				Publishing.new_item( options );
				options.list_key_prefix = `sleep.node.${ options.channel }`;
				console.log( options );
				Publishing.new_item( options );
			}
			catch( error ) { console.log( error ); }
		}

		function command_wrapper( command , options ) {
			switch( command ) {
				case "publish_new_image_set":
					PublisherManager.new_image_set();
					break;
				case "publish_new_frame":
					PublishingManager.new_frame();
					break;
				case "start_pyprocess":
					GenericUtils.startPYProcess();
					break;
				case "stop_pyprocess":
					GenericUtils.stopPYProcess();
					break;
				case "restart_pyprocess":
					GenericUtils.restartPYProcess();
					break;
				case "twilio-call":
					GenericUtils.makeTwilioPythonCall({
						command: "call" ,
						number: options.number ,
					});
				case "twilio-message":
					GenericUtils.makeTwilioPythonMessage({
						command: "message" ,
						number: options.number ,
						message: options.message
					});
					break;
				default:
					break;
			}
		}

		// Python Motion Script Events
		// ============================================================
		events.on( "python-script" , ( options ) => {
			if ( !options ) { return; }
			try{
				if ( options.command ) {
					command_wrapper( options.command );
				}
				python_publish( options );
			}
			catch( error ) {
				console.log( error );
				options.channel = "error";
				python_publish( options );
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
				node_publish({
					channel: "log" ,
					message: message ,
				});
			}
			catch( error ) {
				console.log( error );
				node_publish({
					channel: "errors" ,
					message: "Scheduled Start of Python Motion Script FAILED" ,
				});
			}
		});
		events.on( "scheduled_stop" , () => {
			try{
				const cur_state = GenericUtils.getState();
				let message;
				if ( !cur_state.state ) { message = "Scheduled Start of Python Motion Script"; GenericUtils.startPYProcess(); }
				else { message = "Scheduled Start of Python Motion Script: Scheduled Stop"; GenericUtils.restartPYProcess(); }
				node_publish({
					channel: "log" ,
					message: message ,
				});
			}
			catch( error ) {
				console.log( error );
				node_publish({
					channel: "errors" ,
					message: "Scheduled Start of Python Motion Script FAILED" ,
				});
			}
		});

		// Command Control Events
		// ============================================================
		events.on( "command" , ( options )=> {
			try{
				if ( options.command ) {
					command_wrapper( options.command , options );
				}
				options.channel = "commands";
				options.command = options.command;
				node_publish( options );
			}
			catch( error ) {
				console.log( error );
				options.channel = "errors";
				options.message = `Could Not Run ${ options.command } command`;
				node_publish( options );
			}
		});

		// Native Node.js Script Message Passing
		// ============================================================
		events.on( "server_ready" , ()=> {
			node_publish({ channel: "log" , "message": "SERVER READY" });
		});
		events.on( "message_generic" , ( options ) => {
			Publishing.new_item({
				type: "typ" ,
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