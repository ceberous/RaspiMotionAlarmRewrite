import { Component, OnInit , AfterViewInit , ViewChild , ElementRef } from '@angular/core';
import { IonVirtualScroll } from '@ionic/angular';
//import { IonInfiniteScroll } from '@ionic/angular';

import { WebsocketService } from '../services/websocket.service';
import { LogService } from './log.service';

@Component({
		selector: 'app-log',
		templateUrl: './log.page.html',
		styleUrls: ['./log.page.scss'],
		providers: [ WebsocketService , LogService ]
})
export class LogPage implements OnInit , AfterViewInit {
	//@ViewChild( 'logcontainer' , { static: false } ) logContainerRef: ElementRef;
	//@ViewChild( IonVirtualScroll ) virtualScroll: IonVirtualScroll;
	//@ViewChild( IonInfiniteScroll ) infiniteScroll: IonInfiniteScroll;
	downloaded: object[] = [];
	constructor( private log: LogService ) {}

	ngOnInit() {
	}

	ngAfterViewInit() {
		this.log.logs.subscribe( message => {
			message = JSON.parse( message );
			console.log( message.message );
			this.downloaded.push( message );
			// try{
			// 	this.logContainerRef.nativeElement.scrollTop = this.logContainerRef.nativeElement.scrollHeight;
			// }
			// catch( error ) { console.log( error ); }
			//this.virtualScroll.checkEnd();
		});
	}

}
