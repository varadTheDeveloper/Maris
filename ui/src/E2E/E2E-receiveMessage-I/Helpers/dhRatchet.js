import sodium from "libsodium-wrappers-sumo";
export async function dhRatchet(state, newDhPub) {
    await sodium.ready
  // Reset counters
  state.Nr = 0;
  state.Ns = 0;

  // Step 1: derive receiving chain
  const DH1 = sodium.crypto_scalarmult(
    state.DHs.privateKey,
    newDhPub
  );

  let res = await kdfRK(state.RK, DH1);
  state.RK = res.newRK;
  state.CKr = res.CK;

  // Step 2: generate new sending DH
  state.DHs = sodium.crypto_kx_keypair();

  const DH2 = sodium.crypto_scalarmult(
    state.DHs.privateKey,
    newDhPub
  );

  res = await kdfRK(state.RK, DH2);
  state.RK = res.newRK;
  state.CKs = res.CK;

  state.DHr = newDhPub;
}
