import sodium from "libsodium-wrappers-sumo";
export async function loadRatchetState(storageKey) {
  await sodium.ready
    const raw = localStorage.getItem("ratchetState");
  if (!raw) return null;

  const { nonce, cipher } = JSON.parse(raw);

  const plaintext = sodium.crypto_secretbox_open_easy(
    sodium.from_base64(cipher),
    sodium.from_base64(nonce),
    storageKey
  );

  if (!plaintext) {
    throw new Error("Ratchet state corrupted or wrong password");
  }

  const data = JSON.parse(sodium.to_string(plaintext));

  return {
    RK: sodium.from_base64(data.RK),
    CKs: sodium.from_base64(data.CKs),
    CKr: sodium.from_base64(data.CKr),

    DHs: {
      publicKey: sodium.from_base64(data.DHs.publicKey),
      privateKey: sodium.from_base64(data.DHs.privateKey)
    },

    DHr: data.DHr ? sodium.from_base64(data.DHr) : null,

    Ns: data.Ns,
    Nr: data.Nr,

    skippedKeys: new Map(
      data.skippedKeys.map(([k, v]) => [k, sodium.from_base64(v)])
    ),

    usedMessageKeys: new Set(data.usedMessageKeys)
  };
}
