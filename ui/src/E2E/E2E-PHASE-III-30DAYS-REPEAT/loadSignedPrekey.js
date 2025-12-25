import sodium from "libsodium-wrappers-sumo";



export async function loadSignedPrekey(passphrase) {
  await sodium.ready;

  const raw = localStorage.getItem("Signed_key_encrypted");
  if (!raw) return null; // no identity created

  const stored = JSON.parse(raw);

  const salt = sodium.from_base64(stored.salt);
  const nonce = sodium.from_base64(stored.nonce);
  const cipher = sodium.from_base64(stored.cipher);
  const publicKey = sodium.from_base64(stored.publicKey);
    const signature = sodium.from_base64(stored.signature)

  // derive key
  const encKey = sodium.crypto_pwhash(
    sodium.crypto_secretbox_KEYBYTES,
    sodium.from_string(passphrase),
    salt,
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_ALG_DEFAULT
  );

  // decrypt
  //crypto_secretbox_open_easy takes that ciphertext, 
  // along with the same nonce and key, verifies the MAC first, 
  // and only then decrypts the data. 
  // If verification fails, decryption fails completely.
  const privateKey = sodium.crypto_secretbox_open_easy(cipher, nonce, encKey);
  if (!privateKey) throw new Error("Bad passphrase");

  return { publicKey, privateKey, signature };
}