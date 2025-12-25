import sodium from "libsodium-wrappers-sumo";
import { hkdfSHA256 } from "../E2E-PHASE-V-X3DH/hkdfSHA256";

async function deriveCK(key, info) {
  const zeroSalt = new Uint8Array(32);
  return hkdfSHA256(key, zeroSalt, info);
}

export async function initDoubleRatchetBob(RK, E_A_pub) {
  await sodium.ready;
  const RK_I = sodium.from_base64(RK);
  const CKr = await deriveCK(RK_I, "DR Alice send");
  const CKs = await deriveCK(RK_I, "DR Alice recv");

  return {
  RK_I: sodium.to_base64(RK_I),
    CKr:CKr,
    CKs: CKs,

    DHs: null,          // Bob has not sent yet
    DHr: E_A_pub,       // Alice DH public key (Uint8Array)

    Ns: 0,
    Nr: 0,

    skippedKeys: new Map(),
    usedMessageKeys: new Set()
  };
}
