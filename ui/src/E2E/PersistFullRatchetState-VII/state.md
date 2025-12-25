# main
state = {
  RK,             // Uint8Array
  CKs,            // Uint8Array
  CKr,            // Uint8Array

  DHs,            // X25519 keypair (private + public)
  DHr,            // Uint8Array (public key)

  Ns,             // number
  Nr,             // number

  skippedKeys,    // Map<string, Uint8Array>
  usedMessageKeys // Set<string>
}
