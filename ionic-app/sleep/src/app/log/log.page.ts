import { Component, OnInit , ViewChild } from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';

import { WebsocketService } from '../services/websocket.service';
import { LogService } from './log.service';

@Component({
		selector: 'app-log',
		templateUrl: './log.page.html',
		styleUrls: ['./log.page.scss'],
		providers: [ WebsocketService , LogService ]
})
export class LogPage implements OnInit {
	//@ViewChild( IonInfiniteScroll ) infiniteScroll: IonInfiniteScroll;
	downloaded: object[] = [];
	constructor( private log: LogService ) {
		log.logs.subscribe( message => {
			message = JSON.parse( message );
			console.log( message.message );
			this.downloaded.push( message );
		});
	}

	ngOnInit() {
	}

}
