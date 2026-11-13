/**
 * Cryptographic SHA-256 hashing utility for browser audit workpaper integrity.
 */
export async function calculateSHA256(input: string | ArrayBuffer): Promise<string> {
  const source = typeof input === "string"
    ? new TextEncoder().encode(input)
    : new Uint8Array(input);

  // Copy into a fresh ArrayBuffer so Web Crypto receives an exact, non-shared buffer.
  const exactBuffer = new ArrayBuffer(source.byteLength);
  new Uint8Array(exactBuffer).set(source);
  const hashBuffer = await crypto.subtle.digest("SHA-256", exactBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  return calculateSHA256(arrayBuffer);
}
