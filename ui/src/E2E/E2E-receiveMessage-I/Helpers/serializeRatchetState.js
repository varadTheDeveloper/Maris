// state = {
//   RK,             // Uint8Array
//   CKs,            // Uint8Array
//   CKr,            // Uint8Array

//   DHs,            // X25519 keypair (private + public)
//   DHr,            // Uint8Array (public key)

//   Ns,             // number
//   Nr,             // number

//   skippedKeys,    // Map<string, Uint8Array>
//   usedMessageKeys // Set<string>
// }
import sodium from "libsodium-wrappers-sumo";
export async function serializeRatchetState(state) {
    await sodium.ready
  return JSON.stringify({
    RK: state.RK,
    CKs: state.CKs,
    CKr: state.CKr,

    DHs: {
      publicKey: state.DHs
     
    },

    DHr: state.DHr ? sodium.to_base64(state.DHr) : null,

    Ns: state.Ns,
    Nr: state.Nr,

    skippedKeys: Array.from(state.skippedKeys.entries()).map(([k, v]) => [
      k,
      sodium.to_base64(v),
    ]),

    usedMessageKeys: Array.from(state.usedMessageKeys),
  });
}
