( async ()=> {

	const tweetnacl = require('tweetnacl');
	tweetnacl.util = require('tweetnacl-util');
	tweetnacl.sealedbox = require('tweetnacl-sealedbox-js');

	function generateKeys() {
		const keyPair = tweetnacl.box.keyPair();
		keyPair.publicKey = tweetnacl.util.encodeBase64(keyPair.publicKey);
		keyPair.secretKey = tweetnacl.util.encodeBase64(keyPair.secretKey);
		return keyPair;
	}

	function encrypt( publicKey , encryptMe ) {
		// Decode publicKey from base64
		const publicKeyBin = tweetnacl.util.decodeBase64(publicKey);
		// Encode encryptMe to UTF8
		const encryptMeUTF8 = (new TextEncoder("utf-8")).encode(encryptMe);
		// Encrypt
		const encryptedBin = tweetnacl.sealedbox.seal(encryptMeUTF8, publicKeyBin);
		// Encode encrypted to base64
		const encrypted = tweetnacl.util.encodeBase64(encryptedBin);
		return encrypted;
	}

	function decrypt( secretKey , decryptMe ) {
		// Decode secretKey from base64
		const secretKeyBin = tweetnacl.util.decodeBase64(secretKey);
		// Get corresponding publicKey
		const publicKeyBin = tweetnacl.box.keyPair.fromSecretKey(secretKeyBin).publicKey;
		// Decode decryptMe from base64
		const decryptMeBin = tweetnacl.util.decodeBase64(decryptMe);
		// Decrypt
		const decryptedBin = tweetnacl.sealedbox.open(decryptMeBin, publicKeyBin, secretKeyBin);
		// Decode decrypted to UTF8
		const decryptedUTF8 = ( new TextDecoder("utf-8")).decode(decryptedBin);
		return decryptedUTF8;
	}

	console.log( generateKeys() );

})();