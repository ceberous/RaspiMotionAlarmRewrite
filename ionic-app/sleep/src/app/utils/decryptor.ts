import { environment } from '../../environments/environment'
import { TextEncoder, TextDecoder } from 'text-encoding-utf-8';

// https://github.com/ionic-team/ionic/issues/8274
import tweetnacl from 'tweetnacl'
import tweetnacl_util from 'tweetnacl-util'
import tweetnacl_sealedbox_js from 'tweetnacl-sealedbox-js'

// TODO:
// https://www.npmjs.com/package/ssh2
// https://github.com/Stocard/node-ssh-forward
// Bake ssh port forward into electron, android, and ios apps

// TODO:
// https://stackoverflow.com/questions/43468722/importing-functions-in-typescript#43469239

// export class Decryptor {
//     constructor() {}
//     public decryptBase64( encrypted_base64_string ): string {
//         tweetnacl.util = tweetnacl_util;
//         tweetnacl.sealedbox = tweetnacl_sealedbox_js;
//         const secretKeyBinary = tweetnacl.util.decodeBase64( environment.libsodium.private_key );
//         const publicKeyBinary = tweetnacl.box.keyPair.fromSecretKey( secretKeyBinary ).publicKey;
//         const decryptMessageBinary = tweetnacl.util.decodeBase64( encrypted_base64_string );
//         const decryptedBinary = tweetnacl.sealedbox.open( decryptMessageBinary , publicKeyBinary , secretKeyBinary );
//         const decryptedUTF8 = new TextDecoder( "utf-8" ).decode( decryptedBinary );
//         return decryptedUTF8;
//     }
// }


export function DecryptBase64String( encrypted_base64_string ) {
	tweetnacl.util = tweetnacl_util;
	tweetnacl.sealedbox = tweetnacl_sealedbox_js;
	const secretKeyBinary = tweetnacl.util.decodeBase64( environment.libsodium.private_key );
	const publicKeyBinary = tweetnacl.box.keyPair.fromSecretKey( secretKeyBinary ).publicKey;
	const decryptMessageBinary = tweetnacl.util.decodeBase64( encrypted_base64_string );
	const decryptedBinary = tweetnacl.sealedbox.open( decryptMessageBinary , publicKeyBinary , secretKeyBinary );
	const decryptedUTF8 = new TextDecoder( "utf-8" ).decode( decryptedBinary );
	return decryptedUTF8;
}