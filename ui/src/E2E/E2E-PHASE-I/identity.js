import sodium from "libsodium-wrappers-sumo";

// Local storage key
const STORAGE_KEY = "identity_key_encrypted";

export async function createIdentity(passphrase) {
  await sodium.ready;

  //  Ed25519 identity keypair
  const id = sodium.crypto_sign_keypair();
  const response = await fetch("http://localhost:8080/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bAlicepublicKeyi1: sodium.to_base64(id.publicKey),
      bAliceprivateKeyi2: sodium.to_base64(id.privateKey),
    }),
  });

  const d = await response.json();
  console.log(d);
  // 2. derive encryption key from passphrase
  const salt = sodium.randombytes_buf(16);
  const encKey = sodium.crypto_pwhash(
    sodium.crypto_secretbox_KEYBYTES, // 32-byte key
    sodium.from_string(passphrase), // user pswd
    salt, // same password + different salt → different key
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE, // how many CPU operations are used
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE, //how much RAM is used
    sodium.crypto_pwhash_ALG_DEFAULT // Argon2id
  );

  // 3. encrypt the private key
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  //crypto_secretbox_easy uses XSalsa20,
  // which is a stream cipher that generates random bytes and XORs them with the plaintext.
  //  It then uses Poly1305, which is a MAC, to create an authentication tag.
  // The output is a single ciphertext that contains both the MAC and the encrypted data.
  const cipher = sodium.crypto_secretbox_easy(id.privateKey, nonce, encKey);

  //encKey alway be hkdf and shared secret key not any random pswd

  //sodium.to_base64(bytes)	bytes → Base64 string	Save/send/store keys & ciphertext
  // sodium.from_base64(str)	Base64 string → bytes	Load/restore keys & ciphertext
  //String → Bytes	TextEncoder().encode()	"hello" → [104,101,108,108,111]
  //Bytes → String	TextDecoder().decode()	[104,101,108,108,111] → "hello"
  const data = {
    publicKey: sodium.to_base64(id.publicKey),
    cipher: sodium.to_base64(cipher),
    nonce: sodium.to_base64(nonce),
    salt: sodium.to_base64(salt),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

  return data;
}
