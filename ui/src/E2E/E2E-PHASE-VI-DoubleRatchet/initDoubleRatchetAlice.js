import sodium from "libsodium-wrappers-sumo";
import { hkdfSHA256 } from "../E2E-PHASE-V-X3DH/hkdfSHA256";

async function deriveCK(key, info) {
  const zeroSalt = new Uint8Array(32);
  return hkdfSHA256(key, zeroSalt, info);
}

export async function initDoubleRatchetAlice(RK, E_A) {
  await sodium.ready;
  const RK_I = sodium.from_base64(RK);
  const CKs = await deriveCK(RK_I , "DR Alice send");
  const CKr = await deriveCK(RK_I , "DR Alice recv");

  return {
  RK_I: sodium.to_base64(RK_I),
    CKr: sodium.to_base64(CKr),
    CKs: sodium.to_base64(CKs),

    DHs: E_A,           // Alice DH keypair (X25519)
    DHr: null,          // Bob has not replied yet

    Ns: 0,
    Nr: 0,

    skippedKeys: new Map(),
    usedMessageKeys: new Set()
  };
}
