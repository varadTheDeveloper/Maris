import sodium from "libsodium-wrappers-sumo";
const STORAGE_KEY = "OTP";
export async function generateOneTimePrekeys(params = 1, passphrase) {
  sodium.ready;
  const prekeys = [];
  for (let count = 0; count < params; count++) {
    const kx = sodium.crypto_kx_keypair(); // X25519
    const response = await fetch("http://localhost:8080/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bAlicepublicKeyo1: sodium.to_base64(kx.publicKey),
        bAliceprivateKeyo2: sodium.to_base64(kx.privateKey),
      }),
    });

    prekeys.push({
      publicKey: kx.publicKey,
      privateKey: kx.privateKey,
    });
  }

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
  const keys = JSON.stringify(prekeys);

  const cipher = sodium.crypto_secretbox_easy(
    sodium.from_string(keys),
    nonce,
    encKey
  );
  const data = {
    cipher: sodium.to_base64(cipher),
    nonce: sodium.to_base64(nonce),
    salt: sodium.to_base64(salt),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}
