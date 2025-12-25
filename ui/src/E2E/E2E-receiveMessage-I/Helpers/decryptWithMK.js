import sodium from "libsodium-wrappers-sumo";
export async function decryptWithMK(MK, body) {
  await sodium.ready
  const nonce = sodium.from_base64(body.nonce);
  const ciphertext = sodium.from_base64(body.ciphertext);

  const plaintext = sodium.crypto_secretbox_open_easy(
    ciphertext,
    nonce,
    MK
  );

  if (!plaintext) {
    throw new Error("Decryption failed");
  }

  return sodium.to_string(plaintext);
}

