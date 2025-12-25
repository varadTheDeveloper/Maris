import sodium from "libsodium-wrappers-sumo";
import { hkdfSHA256 } from "./hkdfSHA256.js";

export async function x3dhInitiation(
  I_A1 , // Alice identity keypair (Ed25519)
  I_B_pub1, // Bob identity public key (Ed25519)
  S_B_pub1, // Bob signed prekey public (X25519)
  S_B_sig1, // Signature over S_B_pub
  O_B_pub1 = null, // Bob one-time prekey public (X25519 | null)
) {
  await sodium.ready;

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
 
  const I_A =  sodium.from_base64(I_A1)
  const S_B_pub = sodium.from_base64(S_B_pub1)
  const O_B_pub = sodium.from_base64(O_B_pub1)
const I_B_pub = sodium.from_base64(I_B_pub1)
//   const valid = sodium.crypto_sign_verify_detached(S_B_sig, S_B_pub, I_B_pub);

//   if (!valid) {
//     throw new Error("Invalid signed prekey signature");
//   }
  const E_A = sodium.crypto_kx_keypair(); // X25519

  // libsodium safely converts:
//Ed25519 ↔ Curve25519
//That’s why these functions exist:
//crypto_sign_ed25519_sk_to_curve25519
//crypto_sign_ed25519_pk_to_curve25519

// Ed25519 identity keypair
 // ├── private (scalar-ish) ──▶ sk_to_curve25519 ──▶ X25519 scalar
 // └── public (point)       ──▶ pk_to_curve25519 ──▶ X25519 point
  const I_A_curve = sodium.crypto_sign_ed25519_sk_to_curve25519(I_A);
const I_B_curve = sodium.crypto_sign_ed25519_pk_to_curve25519(I_B_pub);

//X25519 scalar × X25519 point = shared secret
  // DH1 = DH(IK_A, SPK_B) this operation only works on Curve25519 (X25519)
  const dh1 = sodium.crypto_scalarmult(I_A_curve, S_B_pub);

  // DH2 = DH(EK_A, IK_B)
  const dh2 = sodium.crypto_scalarmult(E_A.privateKey, I_B_curve);

  // DH3 = DH(EK_A, SPK_B)
  const dh3 = sodium.crypto_scalarmult(E_A.privateKey, S_B_pub);

  let ikm;

  if (O_B_pub) {
    // DH4 = DH(EK_A, OPK_B)
    const dh4 = sodium.crypto_scalarmult(E_A.privateKey, O_B_pub);

    ikm = concatUint8(dh1, dh2, dh3, dh4);
  } else {
    ikm = concatUint8(dh1, dh2, dh3);
  }

  const zeroSalt = new Uint8Array(32);

  const RK = await hkdfSHA256(ikm, zeroSalt, "X3DH Root Key");

  const CK = await hkdfSHA256(ikm, zeroSalt, "X3DH Chain Key");

  /* -------------------------------------------------- */
  /* 6. CLEANUP                                         */
  /* -------------------------------------------------- */

  E_A.privateKey.fill(0);
  I_A_curve.fill(0);

  /* -------------------------------------------------- */
  /* 7. OUTPUT (WHAT ALICE SENDS TO BOB)                 */
  /* -------------------------------------------------- */
// console.log(ikm,RK,CK,sodium.to_base64(E_A.publicKey))
  return {
    rootKey:  sodium.to_base64(RK),
    chainKey:  sodium.to_base64(CK),
ikm : sodium.to_base64(ikm), // after work remove this 
    header: {
      ephPub: sodium.to_base64(E_A.publicKey),
      usedOneTimePrekey: !!O_B_pub,
    },
  };
}
