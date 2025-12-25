import sodium from "libsodium-wrappers-sumo";
import { serializeRatchetState } from "./serializeRatchetState";
export async function persistRatchetState(state, storageKey) {
  await sodium.ready
    const nonce = sodium.randombytes_buf(
    sodium.crypto_secretbox_NONCEBYTES
  );

  const plaintext = sodium.from_string(
    serializeRatchetState(state)
  );
    // 2. derive encryption key from passphrase
    const salt = sodium.randombytes_buf(16);
    const encKey = sodium.crypto_pwhash(
      sodium.crypto_secretbox_KEYBYTES, // 32-byte key
      sodium.from_string(storageKey), // user pswd
      salt, // same password + different salt → different key
      sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE, // how many CPU operations are used
      sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE, //how much RAM is used
      sodium.crypto_pwhash_ALG_DEFAULT // Argon2id
    );
const key =     sodium.from_string(storageKey)
  const cipher = sodium.crypto_secretbox_easy(
    plaintext,
    nonce,
encKey
  );

  localStorage.setItem("ratchetState", JSON.stringify({
    nonce: sodium.to_base64(nonce),
    cipher: sodium.to_base64(cipher)
  }));
}
