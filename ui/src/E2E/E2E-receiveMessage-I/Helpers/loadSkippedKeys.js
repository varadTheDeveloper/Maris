export function loadSkippedKeys(state, storageKey) {
  const stored = localStorage.getItem("skippedKeys");

  // 1. Nothing stored → nothing to do
  if (!stored) return;

  let parsed;
  try {
    parsed = JSON.parse(stored);
  } catch {
    throw new Error("Corrupted skippedKeys storage (invalid JSON)");
  }

  const nonce = sodium.from_base64(parsed.nonce);
  const cipher = sodium.from_base64(parsed.cipher);

  // 2. Decrypt
  const plaintext = sodium.crypto_secretbox_open_easy(
    cipher,
    nonce,
    storageKey
  );

  if (!plaintext) {
    throw new Error("Skipped keys integrity check failed");
  }

  // 3. Decode plaintext → JS object
  let arr;
  try {
    arr = JSON.parse(sodium.to_string(plaintext));
  } catch {
    throw new Error("Decrypted skipped keys malformed");
  }

  // 4. Restore Map
  for (const { k, mk } of arr) {
    state.skippedKeys.set(k, sodium.from_base64(mk));
  }
}
