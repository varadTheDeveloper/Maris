export async function hkdfSHA256(ikm, salt, info, length = 32) {
// "raw",
// Because ikm is just raw bytes (Uint8Array), not: RSA key, EC key,JWK ,PEM
//HKDF only accepts raw secret bytes.
  const key = await crypto.subtle.importKey(
    "raw",
    ikm, // The actual secret bytes
    { name: "HKDF" }, //WebCrypto must know which algorithm this key will be used with.
    false, // Secrets should not be extractable.
    ["deriveBits"]
  );
//"deriveBits"
  //This key should only be used to: derive bits via HKDF We do not allow:
//encryption decryption signing verification 
// This locks the key to one safe purpose only.

// info 
// "root key" "chain key"
// "message key" "send key" "recv key"

  const bits = await crypto.subtle.deriveBits({
      name: "HKDF", // Algorithm to run.
      hash: "SHA-256", // Hash function used inside HKDF.
      salt,
      info: new TextEncoder().encode(info), //info tells HKDF what this key is for.
    },
    key,  // The imported HKDF key.
    length * 8 // WebCrypto works in bits, not bytes.
  )
  return new Uint8Array(bits) //Because ArrayBuffer is raw memory, and
  //  crypto code needs a view (Uint8Array) 
  // to actually read, slice, pass, and use the bytes.
} 
