export function trySkippedKey(state, dhPub, msgNum) {
  const key = `${dhPub}:${msgNum}`;
  const MK = state.skippedKeys.get(key);

  if (MK) {
    state.skippedKeys.delete(key);
    return MK;
  }

  return null;
}
