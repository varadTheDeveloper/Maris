import sodium from "libsodium-wrappers-sumo";


const STORAGE_KEY = "OTP";
export async function loadOneTimePrekeys(passphrase) {
  await sodium.ready;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null; // no identity created

  const stored = JSON.parse(raw);

  const salt = sodium.from_base64(stored.salt);
  const nonce = sodium.from_base64(stored.nonce);
  const cipher = sodium.from_base64(stored.cipher);


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
  const OTP = sodium.crypto_secretbox_open_easy(cipher, nonce, encKey);
  console.log(OTP);
  const keys = JSON.parse(sodium.to_string(OTP))
   
  if (!OTP) throw new Error("Bad passphrase");

  return keys;
}