import sodium from "libsodium-wrappers-sumo";
import { hkdfSHA256 } from "../E2E-PHASE-V-X3DH/hkdfSHA256";

async function nextMessageKey(CK) {
  const zeroSalt = new Uint8Array(32);
const CK_S = sodium.from_base64(CK)
  const MK = await hkdfSHA256(CK_S, zeroSalt, "DR message");
  const nextCK = await hkdfSHA256(CK_S, zeroSalt, "DR chain");

  return { MK, nextCK };
}

export async function aliceSend(state, plaintext) {
  await sodium.ready;
console.log(state.Ns)
  /* 1. Derive message key */
  const { MK, nextCK } = await nextMessageKey(state.CKs);
  state.CKs = sodium.to_base64(nextCK);

  /* 2. Encrypt */
  const nonce = sodium.randombytes_buf(
    sodium.crypto_secretbox_NONCEBYTES
  );

  const plaintextBytes = sodium.from_string(plaintext);

  const ciphertext = sodium.crypto_secretbox_easy(
    plaintextBytes,
    nonce,
    MK
  );

  /* 3. Build message (USE Ns, THEN increment) */
  const message = {
    header: {
      dh: sodium.to_base64(state.DHs), // Alice DH public key
      n: state.Ns
    },
    body: {
      nonce: sodium.to_base64(nonce),
      ciphertext: sodium.to_base64(ciphertext)
    }
  };

  state.Ns += 1;

  return message;
}
