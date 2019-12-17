import { Component, OnInit } from '@angular/core';
import { WebsocketService } from '../services/websocket.service';
import { LogService } from './log.service';

@Component({
    selector: 'app-log',
    templateUrl: './log.page.html',
    styleUrls: ['./log.page.scss'],
    providers: [ WebsocketService , LogService ]
})
export class LogPage implements OnInit {

  constructor( private log: LogService ) {
    log.downloaded.subscribe( message =>{
        console.log( message );
    });
  }

  ngOnInit() {
  }

}
