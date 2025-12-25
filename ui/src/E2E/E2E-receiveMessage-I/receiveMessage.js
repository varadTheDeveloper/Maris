import sodium from "libsodium-wrappers-sumo";
import { hkdfSHA256 } from "../E2E-PHASE-V-X3DH/hkdfSHA256";

//  Bob side
// stateBob = initDoubleRatchet(RK, CK, "bob");

// text = receiveMessage(stateBob, msg);
//→ "hello bob"
async function receiveMessage(state, msg) {
    await sodium.ready
        const zeroSalt = new Uint8Array(32);  
    const MK = await hkdfSHA256(state.CK_receiving, zeroSalt,"mk")
state.CK_receiving = await hkdfSHA256 (state.CK_receiving,zeroSalt,"ck")
const plaintext = sodium.crypto_secretbox_open_easy(   sodium.from_base64(msg.ciphertext),
    sodium.from_base64(msg.nonce),MK)
    return  new TextDecoder().decode(plaintext);
}