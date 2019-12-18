import { Injectable } from '@angular/core';
import { Observable , Subject } from 'rxjs';
import { WebsocketService } from "../services/websocket.service";
import { GetTimeKeySuffix } from "../utils/generic";
import { DecryptBase64String } from "../utils/decryptor";

import { environment } from '../../environments/environment';

// Rename to get_previous_log()
function get_todays_previous_log() {
	const key = "sleep.log." + GetTimeKeySuffix( environment.timezone );
	// Its Really An Array Based Counting Scheme
	// So count = 31 , really means get 30 events
	// -1 = Get ALL in Redis List
	const count = -1;
	return {
		"type": "redis_get_lrange" ,
		"starting_position": 0 ,
		"ending_position": count ,
		"list_key": key ,
		"channel": "log"
	};
}

@Injectable({
  providedIn: 'root'
})
export class LogService {
	public logs = new Subject<any>();
	public frames = new Subject<any>();
	public deltas = new Subject<any>();
	public thresholds = new Subject<any>();
	public events = new Subject<any>();
	public records = new Subject<any>();
	public event_pools = new Subject<any>();
	public errors = new Subject<any>();
	constructor( private ws: WebsocketService ) {
		this.ws.subject.subscribe( ( message: any )=> {
			console.log( message.message );
			for ( let i = 0; i < message.data.length; ++i ) {
				let decrypted = DecryptBase64String( message.data[ i ] );
				console.log( decrypted );
				switch( message.message ) {
					case "new_info":
						//switch( decrypted.channel ) {}
						this.logs.next( decrypted );
						break;
					case "new_logs":
						this.logs.next( decrypted );
						break;
					case "new_frames":
						this.frames.next( decrypted );
						break;
					case "new_deltas":
						this.deltas.next( decrypted );
						break;
					case "new_thresholds":
						this.thresholds.next( decrypted );
						break;
					case "new_events":
						this.events.next( decrypted );
						break;
					case "new_event_pools":
						this.event_pools.next( decrypted );
						break;
					case "new_records":
						this.records.next( decrypted );
						break;
					case "new_errors":
						this.errors.next( decrypted );
						break;
					default:
						break;
				}
			}
		});
		let log_command = get_todays_previous_log();
		console.log( log_command );
		this.ws.subject.next( log_command );
	}
}
