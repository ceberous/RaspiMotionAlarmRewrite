import { Injectable } from '@angular/core';
import { webSocket , WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../../environments/environment'

// https://rxjs-dev.firebaseapp.com/api/webSocket/webSocket

const WEBSOCKET_URL = `ws://${ environment.websocket.host }:${ environment.websocket.port }`;

@Injectable({
	providedIn: 'root'
})
export class WebsocketService {
	public subject = webSocket({
		url: WEBSOCKET_URL,
	})
	constructor() {
		console.log( this.subject );
	}
}
