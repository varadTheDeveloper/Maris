import sodium from "libsodium-wrappers-sumo";
//function will run every 30 days
export async function generateSignedPrekey(identitykey_private, passphrase) {
  await sodium.ready;
  // X25519 (Curve25519 Diffie-Hellman)
  const signedPrekey = sodium.crypto_kx_keypair()
    const response = await fetch("http://localhost:8080/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bAlicepublicKeys1: sodium.to_base64(signedPrekey.publicKey),
        bAliceprivateKeys2: sodium.to_base64(signedPrekey.privateKey),
      }),
    });
  //Algorithm Ed25519
  //Create digital signature
  //crypto_sign_detached proves “this data really came from me and was not changed”
  //  — it does NOT encrypt anything.
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
  const cipher = sodium.crypto_secretbox_easy(
    signedPrekey.privateKey,
    nonce,
    encKey
  );
  //crypto_sign_detached	Create digital signature
//Input	message + private signing key
//Output	signature (64 bytes)
//Algorithm	Ed25519
//Purpose	Prove identity & integrity

  const signature = sodium.crypto_sign_detached(
    signedPrekey.publicKey,
    identitykey_private
  );
  const data = {
    publicKey: sodium.to_base64(signedPrekey.publicKey),
    cipher: sodium.to_base64(cipher),
    nonce: sodium.to_base64(nonce),
    salt: sodium.to_base64(salt), // store locally 30 days
    signature: sodium.to_base64(signature), // upload to serve
  };
  
  localStorage.setItem("Signed_key_encrypted", JSON.stringify(data));
  return  data
}
