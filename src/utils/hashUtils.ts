/**
 * Cryptographic SHA-256 hashing utility for browser audit workpaper integrity.
 */
export async function calculateSHA256(input: string | ArrayBuffer): Promise<string> {
  let buffer: ArrayBuffer;
  if (typeof input === "string") {
    const encoder = new TextEncoder();
    buffer = encoder.encode(input).buffer;
  } else {
    buffer = input;
  }

  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  return calculateSHA256(arrayBuffer);
}

