import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { verifyPersonalMessageSignature } from '@mysten/sui/verify';
import { toBase64 } from '@mysten/sui/utils'

import { parseSerializedSignature } from '@mysten/sui/cryptography';

  
 // const keypair = new Ed25519Keypair();
 //  const test = await keypair.signPersonalMessage(message);
 //    console.log("signature", test);

async function verifySignature(messageText, signature, walletAddress) {
  try {
    const message = new TextEncoder().encode(messageText);
    const parsed = parseSerializedSignature(signature);
    
    const userSignature = toBase64(parsed.zkLogin.userSignature);
   
    console.log("parsed", parsed);
    const publicKey = await verifyPersonalMessageSignature(message, userSignature);
      
      // if (!publicKey.verifyAddress(walletAddress)) {
      //   return false;
      // }
      return true;
      
  } catch(error) {
    console.log("Error", error);
     return false;
  }
}

export default verifySignature;