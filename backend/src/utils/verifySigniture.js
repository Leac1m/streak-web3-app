// import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { verifyPersonalMessageSignature } from '@mysten/sui/verify';

// const keypair = new Ed25519Keypair();
// const message = new TextEncoder().encode('hello world');
// const { signature } = await keypair.signPersonalMessage(message);

async function verifySignature(message, signature, walletAddress) {
  const publicKey = await verifyPersonalMessageSignature(message, signature);
  
  if (!publicKey.verifyAddress(walletAddress)) {
    return false;
  }

  return true;
}

export default verifySignature;