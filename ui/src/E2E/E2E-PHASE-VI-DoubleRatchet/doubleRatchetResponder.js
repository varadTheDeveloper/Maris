import sodium from "libsodium-wrappers-sumo";
import { hkdfSHA256 } from "../E2E-PHASE-V-X3DH/hkdfSHA256";
async function initDoubleResponder(RK, CK, role) {
  await sodium.ready;
  const zeroSalt = new Uint8Array(32);
  let CK_sending, CK_receiving;

  CK_sending = await hkdfSHA256(CK, zeroSalt, "X3DH recv");
  CK_receiving = await hkdfSHA256(CK, zeroSalt, "X3DH send");

  return {
    RK,
    CK_receiving,
    CK_sending,
  };
}
