import sodium from "libsodium-wrappers-sumo";
import { hkdfSHA256 } from "../E2E-PHASE-V-X3DH/hkdfSHA256.js";
import { trySkippedKey } from "./Helpers/trySkippedKey.js";
import { decryptWithMK } from "./Helpers/decryptWithMK.js";
import { dhRatchet } from "./Helpers/dhRatchet.js";
import { storeSkippedKey } from "./Helpers/storeSkippedKey.js";
import { persistRatchetState } from "../PersistFullRatchetState-VII/persistRatchetState.js";

//most imp read
// Same logic when anything changes
// State change	 Persist means
// Advance CK	 Store new CK
// DH ratchet	Store new RK, DHs, CKs/CKr
// Increment Nr/Ns	Store new counters
// Add skipped key	Store it
// Remove skipped key	Remove it
// state shoild be 
// {
//   RK,
//   CKs,
//   CKr,
//   DHs,          // Bob current DH keypair (X25519) or null
//   DHr,          // Alice current DH public key (Uint8Array)
//   Ns,
//   Nr,
//   skippedKeys: Map(),     // `${dhPub}:${n}` -> MK
//   usedMessageKeys: Set() // `${dhPub}:${n}`
// }

//imp
// // app startup
// const storageKey = await loadStorageKeyFromPassword(); // Argon2 / pwhash
// let state = loadRatchetState(storageKey);

// if (!state) {
//   // only if NO previous session exists
//   state = await initDoubleRatchetBob(RK, E_A_pub);
//   persistRatchetState(state, storageKey);
// }

// Convert state → JSON-safe object



async function nextMessageKey(CK) {
  const zeroSalt = new Uint8Array(32);

  const MK = await hkdfSHA256(CK, zeroSalt, "DR message");
  const nextCK = await hkdfSHA256(CK, zeroSalt, "DR chain");

  return { MK, nextCK };
}
export async function bobReceive(state, message, storageKey) {
  await sodium.ready;

  const { header, body } = message;
  const msgNum = header.n;

  //dhPub is ALWAYS the SENDER’S CURRENT DH PUBLIC KEY (X25519)
  const dhPubBase64 = header.dh;
  const replayKey = `${dhPubBase64}:${msgNum}`;

  /* 1. Replay protection */
  if (state.usedMessageKeys.has(replayKey)) {
    throw new Error("Replay detected");
  }

  /* 2. Try skipped message keys first */
  const skippedMK = trySkippedKey(state, dhPubBase64, msgNum);
  if (skippedMK) {
    const plaintext = decryptWithMK(skippedMK, body);
    state.usedMessageKeys.add(replayKey);
//ALL persistRatchetState WHENEVER:
// You delete a message key
// You store a message key
// You advance CKs or CKr
// You change RK
// You generate a new DH key
// You update replay cache

//Ultra-simple checklist (use this while coding)

// After a function runs, ask:
// Did I change any of these?
// RK
// CKs / CKr
// DHs / DHr
// skippedKeys (add OR delete)
// usedMessageKeys
// Ns / Nr
// If YES → call persistRatchetState
// If NO → don’t
     persistRatchetState(state, storageKey); // ← consume skipped key

    return plaintext;
  }

  /* 3. DH ratchet if DH key changed */
  const senderDh = sodium.from_base64(dhPubBase64);
  if (!state.DHr || !sodium.memcmp(sodium.from_base64(state.DHr), senderDh)) {
    await dhRatchet(state, senderDh);

   persistRatchetState(state, storageKey); // ← DH ratchet changes RK/CKs/CKr
  }

  /* 4. Handle skipped messages */
  if (msgNum < state.Nr) {
    throw new Error("Old or duplicate message");
  }

  while (state.Nr < msgNum) {
    const { MK, nextCK } = await nextMessageKey(state.CKr);
    state.CKr = nextCK;

    storeSkippedKey(state, dhPubBase64, state.Nr, MK);
    state.Nr += 1;
  }

 persistRatchetState(state, storageKey); // ← stored skipped keys

  /* 5. Decrypt current message */
  const { MK, nextCK } = await nextMessageKey(state.CKr);
  state.CKr = nextCK;
  state.Nr += 1;

  const plaintext = decryptWithMK(MK, body);
  state.usedMessageKeys.add(replayKey);

  persistRatchetState(state, storageKey); // ← CKr advanced, message consumed

  return plaintext;
}
