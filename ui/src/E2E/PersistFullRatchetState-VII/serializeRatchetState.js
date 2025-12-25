import sodium from "libsodium-wrappers-sumo";
export async function serializeRatchetState(state) {
  await sodium.ready
    return JSON.stringify({
    RK:state.RK_I,
    CKs: state.CKs,
    CKr: state.CKr,

    DHs: {
      publicKey: state.DHs
    },

    DHr: state.DHr ? state.DHr : null,

    Ns: state.Ns,
    Nr: state.Nr,

    skippedKeys: Array.from(state.skippedKeys.entries()).map(([k, v]) => [
      k,
      sodium.to_base64(v),
    ]),

    usedMessageKeys: Array.from(state.usedMessageKeys),
  });
}
