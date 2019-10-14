import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import tweetnacl from 'tweetnacl'
import tweetnacl_util from 'tweetnacl-util'
import tweetnacl_sealedbox_js from 'tweetnacl-sealedbox-js'

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  public appPages = [
    {
      title: 'Home',
      url: '/home',
      icon: 'home'
    },
    {
      title: 'List',
      url: '/list',
      icon: 'list'
    }
  ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
    // https://github.com/ionic-team/ionic/issues/8274
    tweetnacl.util = tweetnacl_util;
    tweetnacl.sealedbox = tweetnacl_sealedbox_js;
    const keyPair = tweetnacl.box.keyPair();
    keyPair.publicKey = tweetnacl.util.encodeBase64(keyPair.publicKey);
    keyPair.secretKey = tweetnacl.util.encodeBase64(keyPair.secretKey);
    console.log( keyPair );
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
