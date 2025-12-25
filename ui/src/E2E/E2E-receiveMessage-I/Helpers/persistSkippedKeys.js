import { serializeRatchetState } from "./serializeRatchetState";
export function persistRatchetState(state, storageKey) {
  const nonce = sodium.randombytes_buf(
    sodium.crypto_secretbox_NONCEBYTES
  );

  const plaintext = sodium.from_string(
    serializeRatchetState(state)
  );

  const cipher = sodium.crypto_secretbox_easy(
    plaintext,
    nonce,
    storageKey
  );

  localStorage.setItem("ratchetState", JSON.stringify({
    nonce: sodium.to_base64(nonce),
    cipher: sodium.to_base64(cipher)
  }));
}
