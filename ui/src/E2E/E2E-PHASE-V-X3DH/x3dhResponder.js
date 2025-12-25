import sodium from "libsodium-wrappers-sumo";
import { hkdfSHA256 } from "./hkdfSHA256.js";

function concatUint8(...arrays) {
  const len = arrays.reduce((s, a) => s + a.length, 0);
  const out = new Uint8Array(len);
  let offset = 0;
  for (const a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return out;
}

export async function x3dhResponder(
  I_B_base64, // Bob identity keypair (Ed25519)
  S_B_base64, // Bob signed prekey keypair (X25519)
  O_B_base64 , // Bob one-time prekey keypair (X25519 | null)
  I_A_pub_base64, // Alice identity public key (Ed25519)
  E_A_pub_base64 // Alice ephemeral public key (base64)
) {
  await sodium.ready;

  /* -------------------------------------------------- */
  /* 1. DECODE INPUT KEYS                               */
  /* -------------------------------------------------- */
  const I_B = sodium.from_base64(I_B_base64);
  const S_B = sodium.from_base64(S_B_base64);
  const O_B = sodium.from_base64(O_B_base64);
  const I_A_pub = sodium.from_base64(I_A_pub_base64);
  const E_A_pub = sodium.from_base64(E_A_pub_base64);
  const I_A_curve = sodium.crypto_sign_ed25519_pk_to_curve25519(I_A_pub);

  const I_B_curve = sodium.crypto_sign_ed25519_sk_to_curve25519(I_B);

  const dh1 = sodium.crypto_scalarmult(S_B, I_A_curve);
  const dh2 = sodium.crypto_scalarmult(I_B_curve, E_A_pub);
  const dh3 = sodium.crypto_scalarmult(S_B, E_A_pub);

  let ikm;
  if (O_B) {
    const dh4 = sodium.crypto_scalarmult(O_B, E_A_pub);
    ikm = concatUint8(dh1, dh2, dh3, dh4);

    // One-time prekey MUST be deleted after use
    O_B.fill(0);
  } else {
    ikm = concatUint8(dh1, dh2, dh3);
  }

  const zeroSalt = new Uint8Array(32);
  const RK = await hkdfSHA256(ikm, zeroSalt, "X3DH Root Key");
  const CK = await hkdfSHA256(ikm, zeroSalt, "X3DH Chain Key");
  I_B_curve.fill(0);

  return {
    ikm: sodium.to_base64(ikm),
    RK: sodium.to_base64(RK),
    CK: sodium.to_base64(CK),
  };
}
