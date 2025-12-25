export function storeSkippedKey(state, dhPub, msgNum, MK) {
  const key = `${dhPub}:${msgNum}`;
  state.skippedKeys.set(key, MK);
}
// const { header, body } = message;
// const msgNum = header.n;
// const dhPubBase64 = header.dh;
// const replayKey = `${dhPubBase64}:${msgNum}`;
// ("pIqpkZAEJDLKFtrzmcwfxljF-RpS_0hALujfl3BDfWQ:0:rEgtdfCqCqMn6tZN6SYrttx9I4TQj9Xn");
// ("pIqpkZAEJDLKFtrzmcwfxljF-RpS_0hALujfl3BDfWQ:1:rEgtdfCqCqMn6tZN6SYrttx9I4TQj9Xn");
// ("pIqpkZAEJDLKFtrzmcwfxljF-RpS_0hALujfl3BDfWQ:2:rEgtdfCqCqMn6tZN6SYrttx9I4TQj9Xn");
