

export async function sendMessage(state, plaintext) {
  await sodium.ready
    const zeroSalt = new Uint8Array(32);  
    const MK =  await hkdfSHA256(state.CK_sending , zeroSalt,"mk")
    // Advance sending chain
  state.CK_sending = await hkdfSHA256(state.CK_sending,zeroSalt,"ck") 

  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES)
  const cipher = sodium.crypto_secretbox_easy(  new TextEncoder().encode(plaintext),
nonce,MK)
return{
    nonce : sodium.to_base64(nonce),
    cipher : sodium.to_base64(cipher)
}
}
    