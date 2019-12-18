import { Injectable } from '@angular/core';
import { Observable , Subject } from 'rxjs';
import { WebsocketService } from "../services/websocket.service";
import { EasternTimeKeySuffix } from "../utils/get_time_key_suffix";
import { Decryptor } from "../utils/decrypt";

// Rename to get_previous_log()
function get_log_command() {
	const key = "sleep.log." + new EasternTimeKeySuffix().now();
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
	public downloaded = new Subject<any>();
	private decryptor = new Decryptor();
	constructor( private ws: WebsocketService ) {
		this.ws.subject.subscribe( ( message: any )=> {
			if ( message.message !== "new_logs" ) { return; }
			console.log( message.message );
			for ( let i = 0; i < message.data.length; ++i ) {
				let decrypted = this.decryptor.decryptBase64( message.data[ i ] );
				this.downloaded.next( decrypted );
			}
		});
		let log_command = get_log_command();
		console.log( log_command );
		this.ws.subject.next( log_command );
	}
}
