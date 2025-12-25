import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { createIdentity } from "./E2E/E2E-PHASE-I/identity.js";
import { loadIdentity } from "./E2E/E2E-PHASE-II/loadIdentity.JS";
import { generateSignedPrekey } from "./E2E/E2E-PHASE-III-30DAYS-REPEAT/generateSignedPrekey.js";
import { loadSignedPrekey } from "./E2E/E2E-PHASE-III-30DAYS-REPEAT/loadSignedPrekey.js";
import { generateOneTimePrekeys } from "./E2E/E2E-PHASE-IV-OneTimePrekeys/generateOneTimePrekeys.js";
import { loadOneTimePrekeys } from "./E2E/E2E-PHASE-IV-OneTimePrekeys/loadOneTimePrekeys.js";
import { x3dhInitiation } from "./E2E/E2E-PHASE-V-X3DH/x3dhInitiation.js";
import sodium from "libsodium-wrappers-sumo";
import { aliceSend } from "./E2E/E2E-SendMessage-I/aliceSend.js";
import { initDoubleRatchetAlice } from "./E2E/E2E-PHASE-VI-DoubleRatchet/initDoubleRatchetAlice.js";
import { persistRatchetState } from "./E2E/PersistFullRatchetState-VII/persistRatchetState.js";
import { bobReceive } from "./E2E/E2E-receiveMessage-I/bobReceive.js";
import { initDoubleRatchetBob } from "./E2E/E2E-PHASE-VI-DoubleRatchet/initDoubleRatchetBob.js";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [data, setData] = useState(null);
  // after app start

  //   1) Ratchet state  → cryptographic safety
  // 2) Outbox queue   → delivery tracking

  //   async function loadOrInitSession(storageKey) {
  //   const saved = loadRatchetState(storageKey);

  //   if (saved) {
  //     // 🔁 CRASH RECOVERY PATH
  //     console.log("Ratchet state restored");
  //     return saved;
  //   }

  //   // ❗ Only if NO state exists
  //   console.log("No ratchet state, running X3DH");
  //   const { RK, E_A } = await runX3DH();
  //   const state = await initDoubleRatchetAlice(RK, E_A);
  //let state = await initDoubleRatchetAlice(...);
  //   persistRatchetState(state, storageKey);
  //   return state;
  // }
  //
  //send msg
  // async function sendMessage(state, text, storageKey) {
  //   const msg = await aliceSend(state, text);

  //   // 🔐 Persist FIRST
  // persistRatchetState(state, storageKey); //Persistence is a side effect
  //  // 2️⃣ Save message to outbox (delivery safety)
  //saveToOutbox(msg);
  //   // 🌐 Then send
  //   sendToServer(msg);
  // }
  //

  //
  // Alice state already initialized via X3DH + initDoubleRatchetAlice

  // const msg1 = await aliceSend(state, "Hello Bob");
  // persistRatchetState(state, storageKey);
  // sendToServer(msg1);

  // const msg2 = await aliceSend(state, "How are you?");
  // persistRatchetState(state, storageKey);
  // sendToServer(msg2);

  // const msg3 = await aliceSend(state, "Are you there?");
  // persistRatchetState(state, storageKey);
  // sendToServer(msg3);

  useEffect(() => {
    async function createUser() {
      let state = await initDoubleRatchetBob(
        "vgrp6WSSu60dWHBftlW1LYPCtjtdXTarpHOf6A-PeQQ",
        "pIqpkZAEJDLKFtrzmcwfxljF-RpS_0hALujfl3BDfWQ"
      );
            const msg1 = await bobReceive(
        state,
        {
          body: {
            nonce: "qTsadePFEk5K3ac13lLmfuip0c4U_3jv",
            ciphertext: "mKyMLfiupd3TXTvPYGN49p4JAMCUiUPIyw",
          },
          header: { dh: "pIqpkZAEJDLKFtrzmcwfxljF-RpS_0hALujfl3BDfWQ", n: 0 },
        },
        "varad"
      );
         const msg3 = await bobReceive(
        state,
        {
          body: {
            nonce: "rEgtdfCqCqMn6tZN6SYrttx9I4TQj9Xn",
            ciphertext: "cqnYv2oYhf-m3ugwt52AuMXnyU7ijsDCavq-Tx53",
          },
          header: { dh: "pIqpkZAEJDLKFtrzmcwfxljF-RpS_0hALujfl3BDfWQ", n: 2 },
        },
        "varad"
      );

         const msg2 = await bobReceive(
        state,
        {
          body: {
            nonce: "7cvPWGJfqBNIEGlrVKBRCx-ssqJwkaKR",
            ciphertext: "RKt9SOr2n-HRok_qS_giJ4s9oznUjAAsF2n0Iw",
          },
          header: { dh: "pIqpkZAEJDLKFtrzmcwfxljF-RpS_0hALujfl3BDfWQ", n: 1 },
        },
        "varad"
      );
    


   
   
      return { msg1, msg2, msg3 };
    }
    console.log(createUser());
  }, []);

  // imp
  //   On app restart:
  // state = loadRatchetState(storageKey);
  // const outbox = loadOutbox();

  // Now you simply do:
  // for (const msg of outbox.unsentMessages()) {
  //   sendToServer(msg);
  // }
  // 6️⃣ How do you know a message WAS delivered?
  // The server sends an acknowledgement:
  // {
  //   "type": "ack",
  //   "mid": "abc123"
  // }
  // When Alice receives this:
  // removeFromOutbox(mid);
  // That’s it.
  return <></>;
}

export default App;
