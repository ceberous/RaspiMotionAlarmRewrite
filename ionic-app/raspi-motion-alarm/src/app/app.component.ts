import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { environment } from '../environments/environment'

// https://github.com/ionic-team/ionic/issues/8274
import util from 'util'
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
	}

	initializeApp() {
		this.platform.ready().then(() => {
			this.statusBar.styleDefault();
			this.splashScreen.hide();
		});
	}

	generateKeyPair() {
		tweetnacl.util = tweetnacl_util;
		tweetnacl.sealedbox = tweetnacl_sealedbox_js;
		const keyPair = tweetnacl.box.keyPair();
		keyPair.publicKey = tweetnacl.util.encodeBase64( keyPair.publicKey );
		keyPair.secretKey = tweetnacl.util.encodeBase64( keyPair.secretKey );
		console.log( keyPair );
	}

	decrypt( message ) {
		const secretKeyBinary = tweetnacl.util.decodeBase64( environment.libsodium.private_key );
		const publicKeyBinary = tweetnacl.box.keyPair.fromSecretKey( secretKeyBinary ).publicKey;
		const decryptMessageBinary = tweetnacl.util.decodeBase64( message );
		const decryptedBinary = tweetnacl.sealedbox.open( decryptMessageBinary , publicKeyBinary , secretKeyBinary );
		const decryptedUTF8 = ( new util.TextDecoder( "utf-8" ) ).decode( decryptedBinary );
		return decryptedUTF8;
	}

	encrypt( message ) {
		const publicKeyBinary = tweetnacl.util.decodeBase64( environment.libsodium.public_key );
		const messageUTF8 = ( new util.TextEncoder( "utf-8" ) ).encode( message );
		const encryptedBinary = tweetnacl.sealedbox.seal( messageUTF8 , publicKeyBinary );
		const encrypted = tweetnacl.util.encodeBase64( encryptedBinary );
		return encrypted;
	}
}
